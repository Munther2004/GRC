<?php

namespace App\Http\Controllers;

use App\Models\Control;
use App\Models\ControlCrosswalk;
use App\Models\Framework;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CrosswalkController extends Controller
{
    public function index(Request $request)
    {
        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name']);

        // All active controls with their framework and compliance status
        $controlsQuery = Control::with('framework')
            ->where('is_active', true)
            ->when($request->framework_id, fn ($q) => $q->where('framework_id', $request->framework_id))
            ->when($request->search, fn ($q) => $q->where(fn ($q2) => $q2->where('control_id', 'like', "%{$request->search}%")
                ->orWhere('title', 'like', "%{$request->search}%")
            )
            )
            ->orderBy('framework_id')
            ->orderBy('control_id');

        $controls = $controlsQuery->get();

        // Load all crosswalk entries for these controls in one query
        $controlIds = $controls->pluck('id');

        $crosswalkEntries = ControlCrosswalk::with([
            'primaryControl.framework',
            'mappedControl.framework',
        ])
            ->where(fn ($q) => $q->whereIn('primary_control_id', $controlIds)
                ->orWhereIn('mapped_control_id', $controlIds)
            )
            ->get();

        // Build a lookup: control_id => [mappings]
        $mappingsByControl = [];
        foreach ($crosswalkEntries as $entry) {
            $pid = $entry->primary_control_id;
            $mid = $entry->mapped_control_id;
            $mappingsByControl[$pid][] = [
                'id' => $entry->id,
                'direction' => 'outbound',
                'mapping_type' => $entry->mapping_type,
                'notes' => $entry->notes,
                'control' => [
                    'id' => $entry->mappedControl->id,
                    'control_id' => $entry->mappedControl->control_id,
                    'title' => $entry->mappedControl->title,
                    'framework' => $entry->mappedControl->framework->short_name,
                    'current_status' => $entry->mappedControl->current_status,
                ],
            ];
            $mappingsByControl[$mid][] = [
                'id' => $entry->id,
                'direction' => 'inbound',
                'mapping_type' => $entry->mapping_type,
                'notes' => $entry->notes,
                'control' => [
                    'id' => $entry->primaryControl->id,
                    'control_id' => $entry->primaryControl->control_id,
                    'title' => $entry->primaryControl->title,
                    'framework' => $entry->primaryControl->framework->short_name,
                    'current_status' => $entry->primaryControl->current_status,
                ],
            ];
        }

        $controlData = $controls->map(fn ($c) => [
            'id' => $c->id,
            'control_id' => $c->control_id,
            'title' => $c->title,
            'category' => $c->category,
            'framework' => $c->framework->short_name,
            'framework_id' => $c->framework_id,
            'current_status' => $c->current_status,
            'mappings' => $mappingsByControl[$c->id] ?? [],
        ])->groupBy('framework')->toArray();

        $stats = [
            'total_controls' => $controls->count(),
            'with_mappings' => collect($mappingsByControl)->keys()->count(),
            'without_mappings' => $controls->count() - collect($mappingsByControl)->keys()->count(),
            'equivalent' => $crosswalkEntries->where('mapping_type', 'equivalent')->count(),
            'partial' => $crosswalkEntries->where('mapping_type', 'partial')->count(),
            'related' => $crosswalkEntries->where('mapping_type', 'related')->count(),
        ];

        return Inertia::render('crosswalk/index', [
            'frameworks' => $frameworks,
            'controlData' => $controlData,
            'stats' => $stats,
            'filters' => $request->only(['search', 'framework_id']),
        ]);
    }
}
