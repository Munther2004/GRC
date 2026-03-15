<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
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
                'error'   => session('error'),
            ],
            'notifications' => function () {
                if (!auth()->check()) {
                    return ['unread_count' => 0, 'recent' => []];
                }

                $user  = auth()->user();
                $types = NotificationService::typesForRole($user->role);

                $base = Notification::where('is_read', false)
                    ->where(function ($q) use ($user) {
                        $q->whereNull('user_id')
                          ->orWhere('user_id', $user->id);
                    });

                if ($types !== null) {
                    $base->whereIn('type', $types);
                }

                return [
                    'unread_count' => (clone $base)->count(),
                    'recent'       => (clone $base)->orderBy('created_at', 'desc')->take(5)->get(),
                ];
            },
        ];
    }
}