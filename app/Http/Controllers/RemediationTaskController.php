<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Framework;
use App\Models\RemediationTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RemediationTaskController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();

        $user = Auth::user();
        $scoped = fn () => $user->organisationScope(RemediationTask::query());

        $query = $scoped()->with(['control.framework', 'assessment', 'createdBy'])
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status)
            )
            ->when($request->priority && $request->priority !== 'all', fn ($q) => $q->where('priority', $request->priority)
            )
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhereHas('control', fn ($cq) => $cq->where('control_id', 'like', "%{$request->search}%")
                    ->orWhere('title', 'like', "%{$request->search}%")
                )
            )
            // Overdue first, then by due_date ASC, then by priority
            ->orderByRaw("
                CASE
                    WHEN due_date < '{$today}' AND status NOT IN ('completed','cancelled') THEN 0
                    ELSE 1
                END ASC
            ")
            ->orderByRaw('due_date IS NULL, due_date ASC')
            ->orderByRaw("FIELD(priority, 'critical','high','medium','low')")
            ->paginate(25)
            ->withQueryString();

        $tasks = $query->through(fn ($task) => $this->mapTask($task));

        // KPI counts scoped to this user's organisation
        $stats = [
            'total' => $scoped()->count(),
            'open_in_progress' => $scoped()->whereIn('status', ['open', 'in_progress'])->count(),
            'overdue' => $scoped()->whereNotIn('status', ['completed', 'cancelled'])
                ->whereNotNull('due_date')
                ->where('due_date', '<', $today)
                ->count(),
            'completed_this_month' => $scoped()->where('status', 'completed')
                ->whereMonth('closed_at', now()->month)
                ->whereYear('closed_at', now()->year)
                ->count(),
        ];

        // Controls for the "Add Task" form — grouped by framework
        $controls = Control::with('framework')
            ->where('is_active', true)
            ->orderBy('framework_id')
            ->orderBy('control_id')
            ->limit(500)
            ->get(['id', 'control_id', 'title', 'framework_id'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'control_id' => $c->control_id,
                'title' => $c->title,
                'framework' => $c->framework->short_name,
            ]);

        $assessments = Assessment::orderBy('created_at', 'desc')
            ->get(['id', 'title'])
            ->map(fn ($a) => ['id' => $a->id, 'title' => $a->title]);

        return Inertia::render('remediation-tasks/index', [
            'tasks' => $tasks,
            'stats' => $stats,
            'controls' => $controls,
            'assessments' => $assessments,
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'control_id' => 'required|exists:controls,id',
            'assessment_id' => 'nullable|exists:assessments,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:critical,high,medium,low',
            'status' => 'required|in:open,in_progress,completed,cancelled',
            'completion_notes' => 'nullable|string',
        ]);

        $control = Control::findOrFail($validated['control_id']);

        $task = RemediationTask::create([
            ...$validated,
            'created_by' => Auth::id(),
            'corporation_id' => Auth::user()->corporation_id,
            'closed_at' => in_array($validated['status'], ['completed', 'cancelled']) ? now() : null,
        ]);

        AuditLog::record(
            'remediation_task_created',
            'RemediationTask',
            $task->id,
            "Remediation task '{$task->title}' created for control {$control->control_id}"
        );

        return redirect()->route('remediation-tasks.index')
            ->with('success', 'Remediation task created.');
    }

    public function update(Request $request, RemediationTask $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:critical,high,medium,low',
            'status' => 'required|in:open,in_progress,completed,cancelled',
            'completion_notes' => 'nullable|string',
        ]);

        $wasOpen = ! in_array($task->status, ['completed', 'cancelled']);
        $nowClosed = in_array($validated['status'], ['completed', 'cancelled']);

        $task->update([
            ...$validated,
            'closed_at' => ($wasOpen && $nowClosed) ? now() : ($nowClosed ? $task->closed_at : null),
        ]);

        AuditLog::record(
            'remediation_task_updated',
            'RemediationTask',
            $task->id,
            "Remediation task '{$task->title}' updated (status: {$task->status})"
        );

        return redirect()->route('remediation-tasks.index')
            ->with('success', 'Task updated.');
    }

    public function destroy(RemediationTask $task)
    {
        $title = $task->title;
        $id = $task->id;
        $task->delete();

        AuditLog::record(
            'remediation_task_deleted',
            'RemediationTask',
            $id,
            "Remediation task '{$title}' deleted"
        );

        return redirect()->route('remediation-tasks.index')
            ->with('success', 'Task deleted.');
    }

    public function complete(RemediationTask $task)
    {
        if (in_array($task->status, ['completed', 'cancelled'])) {
            return redirect()->route('remediation-tasks.index')
                ->with('error', 'Task is already closed.');
        }

        $task->update([
            'status' => 'completed',
            'closed_at' => now(),
        ]);

        AuditLog::record(
            'remediation_task_completed',
            'RemediationTask',
            $task->id,
            "Remediation task '{$task->title}' manually marked as completed"
        );

        return redirect()->route('remediation-tasks.index')
            ->with('success', 'Task marked as completed.');
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function mapTask(RemediationTask $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'assigned_to' => $task->assigned_to,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'priority' => $task->priority,
            'status' => $task->status,
            'completion_notes' => $task->completion_notes,
            'auto_closed' => $task->auto_closed,
            'closed_at' => $task->closed_at?->toDateTimeString(),
            'is_overdue' => $task->is_overdue,
            'created_at' => $task->created_at->toDateTimeString(),
            'control' => [
                'id' => $task->control->id,
                'control_id' => $task->control->control_id,
                'title' => $task->control->title,
                'framework' => $task->control->framework->short_name,
            ],
            'assessment' => $task->assessment ? [
                'id' => $task->assessment->id,
                'title' => $task->assessment->title,
            ] : null,
            'created_by_name' => $task->createdBy?->name,
        ];
    }
}
