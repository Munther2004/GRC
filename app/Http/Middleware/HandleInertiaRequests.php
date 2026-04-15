<?php

namespace App\Http\Middleware;

use App\Models\ControlStatusRequest;
use App\Models\Notification;
use App\Models\RemediationTask;
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
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'notifications' => function () {
                if (! auth()->check()) {
                    return ['unread_count' => 0, 'recent' => []];
                }

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

                $pendingApprovals = in_array($user->role, ['admin', 'auditor'])
                    ? Cache::remember('badge:pending_approvals', 60, fn () => ControlStatusRequest::where('status', 'pending')->count()
                    )
                    : 0;

                $openRemediationTasks = in_array($user->role, ['admin', 'user'])
                    ? Cache::remember('badge:open_remediation_tasks', 60, fn () => RemediationTask::whereIn('status', ['open', 'in_progress'])->count()
                    )
                    : 0;

                return [
                    'unread_count' => (clone $base)->count(),
                    'recent' => (clone $base)->orderBy('created_at', 'desc')->take(5)->get(),
                    'pending_approvals_count' => $pendingApprovals,
                    'open_remediation_tasks' => $openRemediationTasks,
                ];
            },
        ];
    }
}
