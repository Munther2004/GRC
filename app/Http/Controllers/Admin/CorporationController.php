<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CorporationApproved;
use App\Models\AuditLog;
use App\Models\Corporation;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CorporationController extends Controller
{
    public function index(Request $request)
    {
        $corporations = Corporation::query()
            ->with(['manager', 'users', 'registrations'])
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Corporation::count(),
            'approved' => Corporation::where('status', 'approved')->count(),
            'pending' => Corporation::where('status', 'pending')->count(),
            'rejected' => Corporation::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/corporations/index', [
            'corporations' => $corporations,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Corporation $corporation)
    {
        $corporation->load(['manager', 'users', 'registrations']);

        return Inertia::render('admin/corporations/show', [
            'corporation' => $corporation,
            'managerCredentials' => [
                'username' => $corporation->manager_username,
                'passwordGenerated' => !is_null($corporation->manager_password),
            ],
        ]);
    }

    public function approve(Corporation $corporation)
    {
        if ($corporation->isApproved()) {
            return back()->with('error', 'Corporation is already approved.');
        }

        // 1. Approve and generate fresh registration code
        $corporation->approve();
        $code = $corporation->generateNewCode();

        // 2. Pull contact details from the registration request
        $registration = $corporation->registrations()->latest()->first();
        $managerName  = $registration?->contact_name  ?? "{$corporation->name} Manager";
        $managerEmail = $registration?->contact_email ?? $corporation->email;

        // 3. Check if a manager user already exists for this email
        if (User::where('email', $managerEmail)->exists()) {
            $managerEmail = $corporation->email;
        }
        if (User::where('email', $managerEmail)->exists()) {
            return back()->with('error', "Cannot create manager account — {$managerEmail} is already registered.");
        }

        // 4. Create the manager User
        $tempPassword = bin2hex(random_bytes(8));

        $manager = User::create([
            'name'                   => $managerName,
            'email'                  => $managerEmail,
            'password'               => bcrypt($tempPassword),
            'role'                   => User::ROLE_ADMIN,
            'corporation_id'         => $corporation->id,
            'is_corporation_manager' => true,
        ]);
        $manager->syncRoles([User::ROLE_ADMIN]);

        // 5. Link manager to corporation
        $corporation->update(['manager_user_id' => $manager->id]);

        AuditLog::record('updated', 'Corporation', $corporation->id, "Corporation '{$corporation->name}' approved. Manager account created for {$managerEmail}.");

        // 6. Email the manager their credentials + registration code
        Mail::to($managerEmail)->send(new CorporationApproved(
            $corporation,
            $managerEmail,
            $tempPassword,
            $code,
        ));

        Notification::notifyAdminCorporationApproved($corporation);

        return back()->with('success', "Corporation approved! Manager account created for {$managerEmail} — credentials sent by email.");
    }

    public function reject(Request $request, Corporation $corporation)
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ]);

        $corporation->reject();

        AuditLog::record('updated', 'Corporation', $corporation->id, "Corporation '{$corporation->name}' rejected. Reason: {$validated['reason']}");

        return back()->with('success', 'Corporation rejected.');
    }

    public function regenerateCode(Corporation $corporation)
    {
        if (!$corporation->isApproved()) {
            return back()->with('error', 'Only approved corporations can have their code regenerated.');
        }

        $code = $corporation->generateNewCode();

        AuditLog::record('updated', 'Corporation', $corporation->id, "New registration code generated: {$code}");

        return back()->with('success', "New code generated: {$code}");
    }

    public function destroy(Corporation $corporation)
    {
        if ($corporation->users()->count() > 0) {
            return back()->with('error', 'Cannot delete corporations with active users. Please remove users first.');
        }

        $name = $corporation->name;
        $corporation->delete();

        AuditLog::record('deleted', 'Corporation', $corporation->id, "Corporation '{$name}' deleted");

        return redirect()->route('admin.corporations.index')
            ->with('success', 'Corporation deleted.');
    }
}
