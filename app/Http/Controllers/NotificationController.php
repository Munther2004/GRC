<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    public function index()
    {
        $this->service->generateNotifications();

        $types = NotificationService::typesForRole(auth()->user()->role);

        $query = Notification::where(function ($q) {
                $q->whereNull('user_id')
                  ->orWhere('user_id', auth()->id());
            });

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Notification $notification)
    {
        $notification->update(['is_read' => true]);
        return back();
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
}
