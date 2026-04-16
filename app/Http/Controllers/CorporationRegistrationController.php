<?php

namespace App\Http\Controllers;

use App\Models\Corporation;
use App\Models\CorporationRegistration;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CorporationRegistrationController extends Controller
{
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

        // Generate initial registration code
        $code = strtoupper(bin2hex(random_bytes(8)));

        // Create corporation
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

        // Create registration record
        CorporationRegistration::create([
            'corporation_id' => $corporation->id,
            'contact_name' => $validated['contact_name'],
            'contact_email' => $validated['contact_email'],
            'contact_phone' => $validated['contact_phone'] ?? null,
            'message' => $validated['message'] ?? null,
        ]);

        // Notify super admin
        Notification::notifyAdminCorporationSignup($corporation);

        AuditLog::record('created', 'Corporation', $corporation->id, "Corporation '{$corporation->name}' registration submitted");

        return redirect()->route('corporations.registration-pending', $corporation->id)
            ->with('success', 'Registration submitted successfully!');
    }

    public function pending(Corporation $corporation)
    {
        return Inertia::render('corporations/pending', [
            'corporation' => $corporation,
        ]);
    }

    public function verifyCode(Request $request, Corporation $corporation)
    {
        if (!$corporation->isApproved()) {
            return back()->with('error', 'Corporation is not yet approved.');
        }

        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        if ($validated['code'] !== $corporation->registration_code) {
            return back()->with('error', 'Invalid registration code.');
        }

        // Redirect to corporate manager sign-up with corporation context
        return redirect()->route('corporations.manager-signup', $corporation->id);
    }

    public function showManagerSignup(Corporation $corporation)
    {
        if (!$corporation->isApproved()) {
            return redirect()->route('corporations.registration-pending', $corporation->id)
                ->with('error', 'Corporation is not approved yet.');
        }

        return Inertia::render('corporations/manager-signup', [
            'corporation' => $corporation,
        ]);
    }

    public function registerManager(Request $request, Corporation $corporation)
    {
        if (!$corporation->isApproved()) {
            return back()->with('error', 'Corporation is not approved yet.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create the manager user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'corporation_id' => $corporation->id,
        ]);

        // Assign user role to the manager
        $user->assignRole('user');

        // Update corporation with manager
        $corporation->update(['manager_user_id' => $user->id]);

        AuditLog::record('created', 'User', $user->id, "Manager user '{$user->email}' created for corporation '{$corporation->name}'");

        // Log the user in
        auth()->login($user);

        return redirect()->route('corporate.dashboard')
            ->with('success', 'Welcome! Your corporate account has been set up.');
    }
}
