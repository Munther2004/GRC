<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Framework;
use App\Services\ControlDomainMapper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ControlController extends Controller
{
    public function index(Request $request)
    {
        $query = Control::with('framework')
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhere('control_id', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%")
            )
            ->when($request->framework_id, fn ($q) => $q->where('framework_id', $request->framework_id)
            )
            ->when($request->domain, fn ($q) => $q->where('domain', $request->domain)
            )
            ->when($request->category, fn ($q) => $q->where('category', $request->category)
            )
            ->orderBy('framework_id')
            ->orderBy('control_id')
            ->paginate(20)
            ->withQueryString();

        // Categories are framework-native and only meaningful when a single
        // framework is selected. Domain is the cross-framework taxonomy.
        $categories = $request->framework_id
            ? Control::where('framework_id', $request->framework_id)
                ->distinct()->pluck('category')->sort()->values()
            : collect();

        return Inertia::render('admin/controls/index', [
            'controls' => $query,
            'frameworks' => Framework::orderBy('name')->get(['id', 'name', 'short_name']),
            'categories' => $categories,
            'domains' => ControlDomainMapper::ALL,
            'filters' => $request->only(['search', 'framework_id', 'domain', 'category']),
            'stats' => [
                'total' => Control::count(),
                'by_framework' => Framework::withCount('controls')->get(['id', 'short_name', 'controls_count']),
            ],
        ]);
    }

    public function edit(Control $control)
    {
        return Inertia::render('admin/controls/edit', [
            'control' => $control->load('framework'),
            'frameworks' => Framework::orderBy('name')->get(['id', 'name', 'short_name']),
        ]);
    }

    public function update(Request $request, Control $control)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'implementation_guidance' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $control->update($validated);

        $control->update([
            'domain' => ControlDomainMapper::for(
                $control->framework->short_name ?? '',
                $control->control_id,
                $control->category,
            ),
        ]);

        AuditLog::record('updated', 'Control', $control->id, "Control '{$control->control_id}' updated");

        return redirect()->route('admin.controls.index')
            ->with('success', 'Control updated.');
    }

    public function destroy(Control $control)
    {
        $label = $control->control_id;
        $id = $control->id;
        $control->delete();

        AuditLog::record('deleted', 'Control', $id, "Control '{$label}' deleted");

        return redirect()->route('admin.controls.index')
            ->with('success', 'Control deleted.');
    }
}
