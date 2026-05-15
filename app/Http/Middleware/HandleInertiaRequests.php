<?php

namespace App\Http\Middleware;

use App\Models\Corporation;
use App\Models\ControlStatusRequest;
use App\Models\Notification;
use App\Models\RemediationTask;
use App\Models\SecurityAudit;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'corporationFilter' => $this->corporationFilter($request),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'notifications' => function () use ($request) {
                if (! auth()->check()) {
                    return ['unread_count' => 0, 'recent' => []];
                }

                /** @var User $user */
                $user = auth()->user();
                $types = NotificationService::typesForRole($user->role);

                // Honour ?corporation_id= drill-down for super_admin so the
                // badges reflect the tenant the user is currently looking at.
                $corpFilter = $user->resolveCorporationFilter($request->integer('corporation_id') ?: null);

                $base = Notification::forUser($user, $corpFilter)->where('is_read', false);

                if ($types !== null) {
                    $base->whereIn('type', $types);
                }

                // Approval queue: super_admin / admin / auditor.
                $reviewerRoles = [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_AUDITOR];
                $writerRoles = [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_USER];

                $isSuper = $user->isSuperAdmin();
                // Effective scope corp for all badge queries:
                //   - super_admin drilled in → $corpFilter
                //   - super_admin not drilled → null (= all corps)
                //   - non-super_admin → own corporation_id (regardless of any query param)
                $effectiveCorp = $isSuper ? $corpFilter : $user->corporation_id;
                $cacheTag = $effectiveCorp === null
                    ? ($isSuper ? 'all' : 'none')
                    : "corp:{$effectiveCorp}";

                $pendingApprovals = in_array($user->role, $reviewerRoles, true)
                    ? Cache::remember("badge:pending_approvals:{$cacheTag}", 60, function () use ($isSuper, $effectiveCorp) {
                        $q = ControlStatusRequest::where('status', 'pending');
                        if ($effectiveCorp !== null) {
                            $q->where('corporation_id', $effectiveCorp);
                        } elseif (! $isSuper) {
                            $q->whereRaw('1 = 0');
                        }

                        return $q->count();
                    })
                    : 0;

                $openRemediationTasks = in_array($user->role, $writerRoles, true)
                    ? Cache::remember("badge:open_remediation_tasks:{$cacheTag}", 60, function () use ($isSuper, $effectiveCorp) {
                        $q = RemediationTask::whereIn('status', ['open', 'in_progress']);
                        if ($effectiveCorp !== null) {
                            $q->where('corporation_id', $effectiveCorp);
                        } elseif (! $isSuper) {
                            $q->whereRaw('1 = 0');
                        }

                        return $q->count();
                    })
                    : 0;

                $securityAuditsInProgress = Cache::remember(
                    "badge:security_audits_in_progress:{$cacheTag}:{$user->id}",
                    30,
                    function () use ($isSuper, $effectiveCorp) {
                        $q = SecurityAudit::whereIn('status', ['pending', 'analyzing']);
                        if ($effectiveCorp !== null) {
                            $q->where('corporation_id', $effectiveCorp);
                        } elseif (! $isSuper) {
                            $q->whereRaw('1 = 0');
                        }

                        return $q->count();
                    },
                );

                return [
                    'unread_count' => (clone $base)->count(),
                    'recent' => (clone $base)->orderBy('created_at', 'desc')->take(5)->get(),
                    'pending_approvals_count' => $pendingApprovals,
                    'open_remediation_tasks' => $openRemediationTasks,
                    'security_audits_in_progress' => $securityAuditsInProgress,
                ];
            },
        ];
    }

    /**
     * Provide the corporation picker payload to super_admins.
     *
     * For non-super_admins this is null — they are always confined to their
     * own corporation by backend scoping, so the frontend has no decision to
     * make. For super_admins we expose every approved corporation plus the
     * currently selected `?corporation_id=` query param so the picker can
     * highlight the active filter.
     */
    private function corporationFilter(Request $request): ?array
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return null;
        }

        $selected = $request->integer('corporation_id') ?: null;

        return [
            'selected' => $selected,
            'options' => Corporation::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])
                ->all(),
        ];
    }
}
