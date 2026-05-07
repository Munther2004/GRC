<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Corporation;
use App\Models\CorporationRegistration;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CorporationRegistrationController extends Controller
{
    /**
     * Session key holding proof that the visitor entered the correct
     * registration code for a given corporation. Single-use, time-bound,
     * bound to the corporation id.
     */
    private const VERIFICATION_SESSION_KEY = 'corp_manager_verification';

    /** Verification token expires after 15 minutes. */
    private const VERIFICATION_TTL_SECONDS = 900;

    public function showRegistrationForm()
    {
        return Inertia::render('corporations/register', [
            'industries' => [
                'technology' => 'Technology',
                'finance' => 'Finance',
                'healthcare' => 'Healthcare',
                'retail' => 'Retail',
                'manufacturing' => 'Manufacturing',
                'energy' => 'Energy',
                'telecommunications' => 'Telecommunications',
                'other' => 'Other',
            ],
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255|unique:corporations,name',
            'email' => 'required|email|unique:corporations,email',
            'industry' => 'required|string|in:technology,finance,healthcare,retail,manufacturing,energy,telecommunications,other',
            'website' => 'nullable|url',
            'description' => 'nullable|string|max:1000',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string|max:20',
            'message' => 'nullable|string|max:1000',
        ]);

        $code = strtoupper(bin2hex(random_bytes(8)));

        $corporation = Corporation::create([
            'name' => $validated['company_name'],
            'email' => $validated['email'],
            'industry' => $validated['industry'],
            'website' => $validated['website'] ?? null,
            'description' => $validated['description'] ?? null,
            'registration_code' => $code,
            'last_code_generated_at' => now(),
            'status' => 'pending',
        ]);

        CorporationRegistration::create([
            'corporation_id' => $corporation->id,
            'contact_name' => $validated['contact_name'],
            'contact_email' => $validated['contact_email'],
            'contact_phone' => $validated['contact_phone'] ?? null,
            'message' => $validated['message'] ?? null,
        ]);

        Notification::notifyAdminCorporationSignup($corporation);

        AuditLog::record('created', 'Corporation', $corporation->id, "Corporation '{$corporation->name}' registration submitted");

        return redirect()->route('corporations.registration-pending', $corporation->id)
            ->with('success', 'Registration submitted successfully!');
    }

    public function pending(Corporation $corporation)
    {
        // Sensitive attributes (`registration_code`, `manager_username`,
        // `manager_password`) are hidden by the model — but be explicit
        // about what the public pending page is allowed to see.
        return Inertia::render('corporations/pending', [
            'corporation' => [
                'id' => $corporation->id,
                'name' => $corporation->name,
                'email' => $corporation->email,
                'status' => $corporation->status,
                'industry' => $corporation->industry,
                'website' => $corporation->website,
            ],
        ]);
    }

    public function verifyCode(Request $request, Corporation $corporation)
    {
        if (! $corporation->isApproved()) {
            return back()->with('error', 'Corporation is not yet approved.');
        }

        // If the corporation already has a manager, the self-serve manager-
        // signup flow is closed. Existing managers must use the credentialed
        // login (manager_username / manager_password) issued at approval.
        if ($corporation->hasManager()) {
            return back()->with('error', 'This corporation already has a manager assigned.');
        }

        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        if (! hash_equals((string) $corporation->registration_code, (string) $validated['code'])) {
            return back()->with('error', 'Invalid registration code.');
        }

        // Bind successful verification to the session. registerManager()
        // requires this proof and consumes it (single-use). Stored as a
        // structured array so we can revalidate corporation_id and TTL.
        $request->session()->put(self::VERIFICATION_SESSION_KEY, [
            'corporation_id' => $corporation->id,
            'verified_at' => now()->timestamp,
            'nonce' => bin2hex(random_bytes(16)),
        ]);
        // Defense-in-depth: rotate the session id so a token captured pre-
        // verification cannot be replayed.
        $request->session()->regenerate();

        return redirect()->route('corporations.manager-signup', $corporation->id);
    }

    public function showManagerSignup(Request $request, Corporation $corporation)
    {
        if (! $corporation->isApproved()) {
            return redirect()->route('corporations.registration-pending', $corporation->id)
                ->with('error', 'Corporation is not approved yet.');
        }

        if ($corporation->hasManager()) {
            return redirect()->route('home')
                ->with('error', 'This corporation already has a manager assigned.');
        }

        if (! $this->hasFreshVerification($request, $corporation->id)) {
            return redirect()->route('corporations.registration-pending', $corporation->id)
                ->with('error', 'Please enter your registration code first.');
        }

        return Inertia::render('corporations/manager-signup', [
            'corporation' => [
                'id' => $corporation->id,
                'name' => $corporation->name,
                'email' => $corporation->email,
            ],
        ]);
    }

    public function registerManager(Request $request, Corporation $corporation)
    {
        if (! $corporation->isApproved()) {
            return back()->with('error', 'Corporation is not approved yet.');
        }

        // Hard refusal: do not let an unauthenticated POST overwrite an
        // existing manager. The legitimate manager keeps their account.
        if ($corporation->hasManager()) {
            return redirect()->route('home')
                ->with('error', 'This corporation already has a manager assigned.');
        }

        if (! $this->hasFreshVerification($request, $corporation->id)) {
            return redirect()->route('corporations.registration-pending', $corporation->id)
                ->with('error', 'Registration code verification is required.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Re-check inside a transaction would be ideal; at minimum forget
        // the verification proof BEFORE creating the user so a crash in
        // user creation cannot leave a replayable token in the session.
        $request->session()->forget(self::VERIFICATION_SESSION_KEY);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_ADMIN,
            'corporation_id' => $corporation->id,
            'is_corporation_manager' => true,
        ]);

        $user->syncRoles([User::ROLE_ADMIN]);

        // Atomic-ish guard: only set manager_user_id if it's still null.
        // Prevents a TOCTOU where two requests race past hasManager().
        $updated = Corporation::where('id', $corporation->id)
            ->whereNull('manager_user_id')
            ->update(['manager_user_id' => $user->id]);

        if ($updated === 0) {
            // Lost the race — roll back the user we just created.
            $user->delete();

            return redirect()->route('home')
                ->with('error', 'This corporation already has a manager assigned.');
        }

        AuditLog::record('created', 'User', $user->id, "Manager user '{$user->email}' created for corporation '{$corporation->name}'");

        auth()->login($user);
        $request->session()->regenerate();

        return redirect()->route('corporate.dashboard')
            ->with('success', 'Welcome! Your corporate account has been set up.');
    }

    private function hasFreshVerification(Request $request, int $corporationId): bool
    {
        $proof = $request->session()->get(self::VERIFICATION_SESSION_KEY);

        if (! is_array($proof)) {
            return false;
        }
        if (($proof['corporation_id'] ?? null) !== $corporationId) {
            return false;
        }
        $verifiedAt = (int) ($proof['verified_at'] ?? 0);

        return ($verifiedAt + self::VERIFICATION_TTL_SECONDS) >= now()->timestamp;
    }
}
