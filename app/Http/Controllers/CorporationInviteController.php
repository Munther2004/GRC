<?php

namespace App\Http\Controllers;

use App\Mail\CorporationInviteMail;
use App\Models\AuditLog;
use App\Models\Corporation;
use App\Models\CorporationInvite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CorporationInviteController extends Controller
{
    /**
     * Resolve the corporation an admin is acting on.
     *
     * - Corporation admin: their own corporation. Required.
     * - Super_admin: must pass ?corporation_id=… in the request, otherwise null.
     */
    private function resolveCorporation(Request $request): ?Corporation
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            $id = $request->input('corporation_id') ?? $request->route('corporation_id');
            if (! $id) {
                return null;
            }

            return Corporation::find($id);
        }

        return $user->corporation_id ? Corporation::find($user->corporation_id) : null;
    }

    private function ensureCanManage(Request $request, CorporationInvite $invite): void
    {
        $user = $request->user();
        if ($user->isSuperAdmin()) {
            return;
        }
        if (! $user->corporation_id || $invite->corporation_id !== $user->corporation_id) {
            abort(403);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $corporation = $this->resolveCorporation($request);

        $invites = collect();
        $shareable = null;

        if ($corporation) {
            $base = CorporationInvite::query()->where('corporation_id', $corporation->id);

            $shareable = (clone $base)->shareable()->active()->latest()->first();

            $invites = (clone $base)
                ->email()
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn (CorporationInvite $i) => [
                    'id' => $i->id,
                    'email' => $i->email,
                    'status' => $i->status(),
                    'expires_at' => $i->expires_at?->toIso8601String(),
                    'created_at' => $i->created_at?->toIso8601String(),
                    'last_used_at' => $i->last_used_at?->toIso8601String(),
                    'use_count' => $i->use_count,
                    'url' => route('invite.show', $i->token),
                ]);
        }

        $allCorporations = $user->isSuperAdmin()
            ? Corporation::where('status', 'approved')->orderBy('name')->get(['id', 'name'])
            : collect();

        return Inertia::render('admin/invites/index', [
            'corporation' => $corporation ? [
                'id' => $corporation->id,
                'name' => $corporation->name,
            ] : null,
            'shareable' => $shareable ? [
                'id' => $shareable->id,
                'token' => $shareable->token,
                'url' => route('invite.show', $shareable->token),
                'expires_at' => $shareable->expires_at?->toIso8601String(),
                'use_count' => $shareable->use_count,
                'created_at' => $shareable->created_at?->toIso8601String(),
            ] : null,
            'emailInvites' => $invites,
            'allCorporations' => $allCorporations,
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    public function storeShareable(Request $request)
    {
        $validated = $request->validate([
            'expires_in_days' => 'nullable|integer|min:1|max:365',
            'corporation_id' => 'nullable|integer|exists:corporations,id',
        ]);

        $corporation = $this->resolveCorporation($request);
        if (! $corporation) {
            return back()->with('error', 'Select a corporation first.');
        }

        // Revoke any prior active shareable link for this corp so there is at
        // most one current shareable URL.
        CorporationInvite::query()
            ->where('corporation_id', $corporation->id)
            ->shareable()
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        $expires = now()->addDays((int) ($validated['expires_in_days'] ?? 30));

        $invite = CorporationInvite::create([
            'corporation_id' => $corporation->id,
            'token' => CorporationInvite::generateToken(),
            'email' => null,
            'type' => CorporationInvite::TYPE_SHAREABLE,
            'expires_at' => $expires,
            'max_uses' => null,
            'created_by_user_id' => $request->user()->id,
        ]);

        AuditLog::record('created', 'CorporationInvite', $invite->id,
            "Shareable invite link generated for corporation '{$corporation->name}'");

        return back()->with('success', 'Shareable invite link generated.');
    }

    public function storeEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'expires_in_days' => 'nullable|integer|min:1|max:90',
            'corporation_id' => 'nullable|integer|exists:corporations,id',
        ]);

        $corporation = $this->resolveCorporation($request);
        if (! $corporation) {
            return back()->with('error', 'Select a corporation first.');
        }

        $expires = now()->addDays((int) ($validated['expires_in_days'] ?? 7));

        $invite = CorporationInvite::create([
            'corporation_id' => $corporation->id,
            'token' => CorporationInvite::generateToken(),
            'email' => $validated['email'],
            'type' => CorporationInvite::TYPE_EMAIL,
            'expires_at' => $expires,
            'max_uses' => 1,
            'created_by_user_id' => $request->user()->id,
        ]);

        $url = route('invite.show', $invite->token);

        try {
            Mail::to($invite->email)->send(new CorporationInviteMail($invite, $url));
        } catch (\Throwable $e) {
            // Don't lose the invite if mail transport is down; admin can copy the link.
            report($e);
        }

        AuditLog::record('created', 'CorporationInvite', $invite->id,
            "Email invite sent to {$invite->email} for '{$corporation->name}'");

        return back()->with('success', "Invitation sent to {$invite->email}.");
    }

    public function destroy(Request $request, CorporationInvite $invite)
    {
        $this->ensureCanManage($request, $invite);

        $invite->forceFill(['revoked_at' => now()])->save();

        AuditLog::record('updated', 'CorporationInvite', $invite->id, 'Invite revoked');

        return back()->with('success', 'Invite revoked.');
    }
}
