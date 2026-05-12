<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CorporationApproved;
use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Corporation;
use App\Models\CorporationControlStatus;
use App\Models\CorporationInvite;
use App\Models\Evidence;
use App\Models\Notification;
use App\Models\RemediationTask;
use App\Models\Risk;
use App\Models\RiskAppetite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            // super_admin admin view legitimately needs the registration code
            // and manager username; the model hides them globally so we
            // explicitly opt this gated view back in. Manager password is
            // never exposed — only a "passwordGenerated" boolean.
            'corporation' => $corporation->makeVisible(['registration_code', 'manager_username']),
            'managerCredentials' => [
                'username' => $corporation->manager_username,
                'passwordGenerated' => ! is_null($corporation->manager_password),
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
        $managerName = $registration?->contact_name ?? "{$corporation->name} Manager";
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
            'name' => $managerName,
            'email' => $managerEmail,
            'password' => bcrypt($tempPassword),
            'role' => User::ROLE_ADMIN,
            'corporation_id' => $corporation->id,
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
        if (! $corporation->isApproved()) {
            return back()->with('error', 'Only approved corporations can have their code regenerated.');
        }

        $code = $corporation->generateNewCode();

        AuditLog::record('updated', 'Corporation', $corporation->id, "New registration code generated: {$code}");

        return back()->with('success', "New code generated: {$code}");
    }

    public function destroy(Corporation $corporation)
    {
        $name = $corporation->name;
        $corpId = $corporation->id;
        $userIds = $corporation->users()->pluck('id')->all();

        DB::transaction(function () use ($corporation, $corpId, $userIds) {
            // Detach the manager pointer before purging users so the
            // FK to users.id on corporations.manager_user_id is released.
            $corporation->update(['manager_user_id' => null]);

            // Tenant-scoped data. Order matters: child rows first so we
            // don't trip referential constraints on tables without ON DELETE
            // CASCADE configured at the DB level.
            Evidence::whereIn('user_id', $userIds)->delete();
            RemediationTask::where('corporation_id', $corpId)->delete();
            Risk::where('corporation_id', $corpId)->delete();
            Assessment::where('corporation_id', $corpId)->delete();
            RiskAppetite::where('corporation_id', $corpId)->delete();
            CorporationControlStatus::where('corporation_id', $corpId)->delete();
            CorporationInvite::where('corporation_id', $corpId)->delete();

            // Drop the users belonging to this corporation. super_admins
            // (corporation_id = NULL) are never in $userIds and stay intact.
            User::whereIn('id', $userIds)->delete();

            $corporation->registrations()->delete();
            $corporation->delete();
        });

        AuditLog::record('deleted', 'Corporation', $corpId, "Corporation '{$name}' deleted (cascade: ".count($userIds).' user(s) and tenant data removed)');

        return redirect()->route('admin.corporations.index')
            ->with('success', "Corporation '{$name}' and all related data deleted.");
    }
}
