<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Framework;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrameworkController extends Controller
{
    public function index()
    {
        $frameworks = Framework::withCount('controls')->orderBy('name')->get();

        return Inertia::render('admin/frameworks/index', [
            'frameworks' => $frameworks,
        ]);
    }

    public function toggle(Framework $framework)
    {
        $framework->update(['is_active' => !$framework->is_active]);

        AuditLog::record(
            'updated',
            'Framework',
            $framework->id,
            "Framework '{$framework->name}' " . ($framework->is_active ? 'activated' : 'deactivated')
        );

        return back()->with('success', "Framework {$framework->name} " . ($framework->is_active ? 'activated' : 'deactivated') . '.');
    }

    public function edit(Framework $framework)
    {
        return Inertia::render('admin/frameworks/edit', [
            'framework' => $framework,
        ]);
    }

    public function update(Request $request, Framework $framework)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'version'     => 'nullable|string|max:50',
        ]);

        $framework->update($validated);

        AuditLog::record('updated', 'Framework', $framework->id, "Framework '{$framework->name}' updated");

        return redirect()->route('admin.frameworks.index')
            ->with('success', 'Framework updated.');
    }
}