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
            'notifications' => function () {
                if (! auth()->check()) {
                    return ['unread_count' => 0, 'recent' => []];
                }

                /** @var User $user */
                $user = auth()->user();
                $types = NotificationService::typesForRole($user->role);

                $base = Notification::where('is_read', false)
                    ->where(function ($q) use ($user) {
                        $q->whereNull('user_id')
                            ->orWhere('user_id', $user->id);
                    });

                if ($types !== null) {
                    $base->whereIn('type', $types);
                }

                // Approval queue: super_admin / admin / auditor.
                $reviewerRoles = [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_AUDITOR];
                $writerRoles = [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_USER];

                $isSuper = $user->isSuperAdmin();
                $corpId = $user->corporation_id;
                $cacheTag = $isSuper ? 'all' : "corp:{$corpId}";

                $pendingApprovals = in_array($user->role, $reviewerRoles, true)
                    ? Cache::remember("badge:pending_approvals:{$cacheTag}", 60, function () use ($isSuper, $corpId) {
                        $q = ControlStatusRequest::where('status', 'pending');
                        // Phase 3 added control_status_requests.corporation_id;
                        // use the column directly instead of joining users.
                        if (! $isSuper) {
                            $q->where('corporation_id', $corpId);
                        }

                        return $q->count();
                    })
                    : 0;

                $openRemediationTasks = in_array($user->role, $writerRoles, true)
                    ? Cache::remember("badge:open_remediation_tasks:{$cacheTag}", 60, function () use ($isSuper, $corpId) {
                        $q = RemediationTask::whereIn('status', ['open', 'in_progress']);
                        if (! $isSuper && $corpId) {
                            $q->where('corporation_id', $corpId);
                        } elseif (! $isSuper && ! $corpId) {
                            $q->whereRaw('1 = 0');
                        }

                        return $q->count();
                    })
                    : 0;

                $securityAuditsInProgress = Cache::remember(
                    'badge:security_audits_in_progress:'.$user->id,
                    30,
                    function () use ($isSuper, $user) {
                        $q = SecurityAudit::whereIn('status', ['pending', 'analyzing']);
                        // security_audits.corporation_id was added in Phase 3
                        // of the security remediation. Use the column directly.
                        if (! $isSuper) {
                            if (! $user->corporation_id) {
                                $q->whereRaw('1 = 0');
                            } else {
                                $q->where('corporation_id', $user->corporation_id);
                            }
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
