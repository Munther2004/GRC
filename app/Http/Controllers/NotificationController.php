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
        $user = auth()->user();
        $types = NotificationService::typesForRole($user->role);

        $query = Notification::forUser($user);

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
        $user = auth()->user();
        $types = NotificationService::typesForRole($user->role);

        $query = Notification::forUser($user);

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        $notifications = $query->orderBy('created_at', 'desc')->limit(10)->get();

        return response()->json($notifications);
    }

    public function markRead(Notification $notification)
    {
        $this->authorizeAccess($notification);
        $notification->update(['is_read' => true]);

        return back();
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        $this->authorizeAccess($notification);
        $notification->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function markAllRead()
    {
        $user = auth()->user();
        $types = NotificationService::typesForRole($user->role);

        $query = Notification::forUser($user)->where('is_read', false);

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        $query->update(['is_read' => true]);

        return back();
    }

    public function destroy(Notification $notification)
    {
        $this->authorizeAccess($notification);
        $notification->delete();

        return back();
    }

    public function destroyAll()
    {
        Notification::forUser(auth()->user())->delete();

        return back();
    }

    /**
     * Visibility check for marking/deleting a single notification.
     * Personal notifications (user_id != null) belong to that user.
     * Broadcast notifications (user_id IS NULL) are accessible to:
     *   - any super_admin (sees all tenants)
     *   - any user whose corporation matches notification.corporation_id
     */
    private function authorizeAccess(Notification $notification): void
    {
        $user = auth()->user();
        if ($notification->user_id !== null) {
            if ($notification->user_id !== $user->id) {
                abort(403);
            }

            return;
        }
        if ($user->isSuperAdmin()) {
            return;
        }
        if ($notification->corporation_id === null || $notification->corporation_id !== $user->corporation_id) {
            abort(403);
        }
    }
}
