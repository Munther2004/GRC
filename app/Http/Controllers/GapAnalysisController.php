<?php

namespace App\Http\Controllers;

use App\Models\AssessmentItem;
use App\Models\Framework;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GapAnalysisController extends Controller
{
    public function index(Request $request)
    {
        $frameworks = Framework::where('is_active', true)->get(['id', 'name', 'short_name']);

        $query = AssessmentItem::with(['control', 'assessment.framework', 'assessment.user'])
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))
            ->when($request->framework_id, fn ($q) => $q->whereHas('assessment', fn ($q2) => $q2->where('framework_id', $request->framework_id)
            )
            )
            ->when($request->status, fn ($q) => $q->where('compliance_status', $request->status)
            )
            ->when($request->category, fn ($q) => $q->whereHas('control', fn ($q2) => $q2->where('category', $request->category)
            )
            )
            ->when($request->search, fn ($q) => $q->whereHas('control', fn ($q2) => $q2->where('title', 'like', "%{$request->search}%")
                ->orWhere('control_id', 'like', "%{$request->search}%")
            )
            )
            ->orderBy('compliance_status')
            ->paginate(25)
            ->withQueryString();

        $categories = AssessmentItem::whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))
            ->join('controls', 'assessment_items.control_id', '=', 'controls.id')
            ->distinct()
            ->pluck('controls.category')
            ->sort()
            ->values();

        $stats = [
            'non_compliant' => AssessmentItem::where('compliance_status', 'non_compliant')
                ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))->count(),
            'partially_compliant' => AssessmentItem::where('compliance_status', 'partially_compliant')
                ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))->count(),
            'by_framework' => $frameworks->map(function ($f) {
                return [
                    'name' => $f->short_name,
                    'non_compliant' => AssessmentItem::where('compliance_status', 'non_compliant')
                        ->whereHas('assessment', fn ($q) => $q->where('status', 'completed')->where('framework_id', $f->id))
                        ->count(),
                    'partially_compliant' => AssessmentItem::where('compliance_status', 'partially_compliant')
                        ->whereHas('assessment', fn ($q) => $q->where('status', 'completed')->where('framework_id', $f->id))
                        ->count(),
                ];
            }),
        ];

        return Inertia::render('gap-analysis/index', [
            'items' => $query,
            'frameworks' => $frameworks,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'framework_id', 'status', 'category']),
        ]);
    }
}
