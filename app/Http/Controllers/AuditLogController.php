<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::with('user')
            ->when($request->search, fn($q) =>
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhere('action', 'like', "%{$request->search}%")
                  ->orWhere('model_type', 'like', "%{$request->search}%")
            )
            ->when($request->action, fn($q) =>
                $q->where('action', $request->action)
            )
            ->when($request->model_type, fn($q) =>
                $q->where('model_type', $request->model_type)
            )
            ->when($request->date_from, fn($q) =>
                $q->whereDate('created_at', '>=', $request->date_from)
            )
            ->when($request->date_to, fn($q) =>
                $q->whereDate('created_at', '<=', $request->date_to)
            )
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $actions    = AuditLog::distinct()->pluck('action')->sort()->values();
        $modelTypes = AuditLog::distinct()->pluck('model_type')->sort()->values();

        $stats = [
            'total'   => AuditLog::count(),
            'today'   => AuditLog::whereDate('created_at', today())->count(),
            'week'    => AuditLog::where('created_at', '>=', now()->subWeek())->count(),
        ];

        return Inertia::render('audit-logs/index', [
            'logs'       => $logs,
            'actions'    => $actions,
            'modelTypes' => $modelTypes,
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'action', 'model_type', 'date_from', 'date_to']),
        ]);
    }
}