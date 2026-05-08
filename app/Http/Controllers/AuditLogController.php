<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $base = fn () => $this->scopedQuery();

        $logs = $base()->with('user')
            ->when($request->search, fn ($q) => $q->where(function ($qq) use ($request) {
                $qq->where('description', 'like', "%{$request->search}%")
                    ->orWhere('action', 'like', "%{$request->search}%")
                    ->orWhere('model_type', 'like', "%{$request->search}%");
            }))
            ->when($request->action, fn ($q) => $q->where('action', $request->action))
            ->when($request->model_type, fn ($q) => $q->where('model_type', $request->model_type))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $actions = $base()->distinct()->pluck('action')->sort()->values();
        $modelTypes = $base()->distinct()->pluck('model_type')->sort()->values();

        $stats = [
            'total' => $base()->count(),
            'today' => $base()->whereDate('created_at', today())->count(),
            'week' => $base()->where('created_at', '>=', now()->subWeek())->count(),
        ];

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'actions' => $actions,
            'modelTypes' => $modelTypes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'action', 'model_type', 'date_from', 'date_to']),
        ]);
    }

    /**
     * AuditLog has no corporation_id of its own — scope through the actor's
     * tenant via the related user. super_admin sees the full timeline.
     */
    private function scopedQuery(): Builder
    {
        $user = Auth::user();
        if ($user->isSuperAdmin()) {
            return AuditLog::query();
        }

        $corpId = $user->corporation_id;
        $userIds = User::where('corporation_id', $corpId)->pluck('id');

        return AuditLog::whereIn('user_id', $userIds);
    }
}
