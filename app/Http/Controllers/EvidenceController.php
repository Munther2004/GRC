<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EvidenceController extends Controller
{
    public function index(Request $request)
    {
        $query = Evidence::with([
            'user',
            'assessmentItem.control',
            'assessmentItem.assessment.framework',
            'assessmentItem.assessment.user',
        ])
        ->when($request->search, fn($q) =>
            $q->where('title', 'like', "%{$request->search}%")
              ->orWhere('file_name', 'like', "%{$request->search}%")
        )
        ->when($request->status, fn($q) =>
            $q->where('status', $request->status)
        )
        ->when($request->framework_id, fn($q) =>
            $q->whereHas('assessmentItem.assessment', fn($q2) =>
                $q2->where('framework_id', $request->framework_id)
            )
        )
        ->when($request->assessment_id, fn($q) =>
            $q->whereHas('assessmentItem', fn($q2) =>
                $q2->where('assessment_id', $request->assessment_id)
            )
        )
        ->orderBy('created_at', 'desc')
        ->paginate(20)
        ->withQueryString();

        $stats = [
            'total'    => Evidence::count(),
            'pending'  => Evidence::where('status', 'pending')->count(),
            'approved' => Evidence::where('status', 'approved')->count(),
            'rejected' => Evidence::where('status', 'rejected')->count(),
        ];

        return Inertia::render('evidence/index', [
            'evidence'    => $query,
            'frameworks'  => Framework::where('is_active', true)->get(['id', 'name', 'short_name']),
            'assessments' => Assessment::where('status', 'completed')->orderBy('title')->get(['id', 'title']),
            'stats'       => $stats,
            'filters'     => $request->only(['search', 'status', 'framework_id', 'assessment_id']),
        ]);
    }

    public function approve(Evidence $evidence)
    {
        $evidence->update(['status' => 'approved']);

        AuditLog::record(
            'updated',
            'Evidence',
            $evidence->id,
            "Evidence '{$evidence->title}' approved"
        );

        return back()->with('success', 'Evidence approved.');
    }

    public function reject(Evidence $evidence)
    {
        $evidence->update(['status' => 'rejected']);

        AuditLog::record(
            'updated',
            'Evidence',
            $evidence->id,
            "Evidence '{$evidence->title}' rejected"
        );

        return back()->with('success', 'Evidence rejected.');
    }

    public function download(Evidence $evidence)
    {
        if (!Storage::disk('public')->exists($evidence->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($evidence->file_path, $evidence->file_name);
    }

    public function destroy(Evidence $evidence)
    {
        Storage::disk('public')->delete($evidence->file_path);

        $title = $evidence->title;
        $id    = $evidence->id;
        $evidence->delete();

        AuditLog::record('deleted', 'Evidence', $id, "Evidence '{$title}' deleted");

        return back()->with('success', 'Evidence deleted.');
    }
}