<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    public function index()
    {
        $types = NotificationService::typesForRole(auth()->user()->role);

        $query = Notification::where(function ($q) {
            $q->whereNull('user_id')
                ->orWhere('user_id', auth()->id());
        });

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);

        // Pass paginated notifications under a distinct key so the shared
        // 'notifications' badge prop (unread_count, etc.) from
        // HandleInertiaRequests is not overwritten on this page. Without this
        // rename the sidebar badge becomes stale and renders the previous
        // visit's value (often shown as "99+") while the user is on /notifications.
        return Inertia::render('notifications/index', [
            'notificationList' => $notifications,
        ]);
    }

    public function getNotifications(): JsonResponse
    {
        $types = NotificationService::typesForRole(auth()->user()->role);

        $query = Notification::where(function ($q) {
            $q->whereNull('user_id')
                ->orWhere('user_id', auth()->id());
        });

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        $notifications = $query->orderBy('created_at', 'desc')->limit(10)->get();

        return response()->json($notifications);
    }

    public function markRead(Notification $notification)
    {
        $notification->update(['is_read' => true]);

        return back();
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        $notification->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function markAllRead()
    {
        $types = NotificationService::typesForRole(auth()->user()->role);

        $query = Notification::where('is_read', false)
            ->where(function ($q) {
                $q->whereNull('user_id')
                    ->orWhere('user_id', auth()->id());
            });

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        $query->update(['is_read' => true]);

        return back();
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();

        return back();
    }

    public function destroyAll()
    {
        Notification::query()->delete();

        return back();
    }
}
