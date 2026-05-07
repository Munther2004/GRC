<?php

namespace App\Http\Controllers;

use App\Models\Corporation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CorporateDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get corporation(s) managed by this user
        $managedCorporations = $user->managedCorporations()->get();

        if ($managedCorporations->isEmpty()) {
            return redirect()->route('dashboard')->with('error', 'No corporations found.');
        }

        // If user manages only one corporation, show that one
        $corporation = $managedCorporations->first();

        $stats = [
            'total_users' => $corporation->users()->count(),
            'pending_approvals' => 0,
            'total_assessments' => 0,
        ];

        return Inertia::render('corporate/dashboard', [
            'corporation' => $corporation->makeVisible('registration_code'),
            'stats' => $stats,
            'users' => $corporation->users()->get(),
        ]);
    }

    public function show(Corporation $corporation, Request $request)
    {
        // Verify user is manager of this corporation
        if ($request->user()->id !== $corporation->manager_user_id) {
            return redirect()->route('corporate.dashboard')->with('error', 'Unauthorized');
        }

        $stats = [
            'total_users' => $corporation->users()->count(),
            'total_risks' => 0,
            'total_assessments' => 0,
        ];

        return Inertia::render('corporate/dashboard', [
            'corporation' => $corporation,
            'stats' => $stats,
            'users' => $corporation->users()->get(),
        ]);
    }

    public function companyDetails(Request $request)
    {
        $user = $request->user();

        // Get managed corporation
        $corporation = $user->managedCorporations()->first();

        if (! $corporation) {
            return redirect()->route('corporate.dashboard')->with('error', 'No corporation found.');
        }

        $corporation->load(['manager', 'users']);

        return Inertia::render('corporate/company-details', [
            'corporation' => $corporation,
        ]);
    }

    public function teamMembers(Request $request)
    {
        $user = $request->user();

        // Get managed corporation
        $corporation = $user->managedCorporations()->first();

        if (! $corporation) {
            return redirect()->route('corporate.dashboard')->with('error', 'No corporation found.');
        }

        $users = $corporation->users()
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->get();

        $stats = [
            'total_users' => $users->count(),
            'admins' => $users->where('role', \App\Models\User::ROLE_ADMIN)->count(),
            'auditors' => $users->where('role', \App\Models\User::ROLE_AUDITOR)->count(),
            'users' => $users->where('role', \App\Models\User::ROLE_USER)->count(),
        ];

        return Inertia::render('corporate/team-members', [
            'corporation' => $corporation,
            'users' => $users,
            'stats' => $stats,
        ]);
    }
}
