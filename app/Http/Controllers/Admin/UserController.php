<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Corporation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Roles a corporation admin (non-super) is allowed to grant.
     * super_admin can grant any role from User::VALID_ROLES.
     */
    private const CORP_ADMIN_GRANTABLE = [User::ROLE_AUDITOR, User::ROLE_USER];

    public function index(Request $request)
    {
        $actor = $request->user();

        $base = User::query()->with(['roles', 'corporation']);

        if (! $actor->isSuperAdmin()) {
            $base->where('corporation_id', $actor->corporation_id);
        }

        $users = (clone $base)
            ->when($request->search, fn ($q) => $q->where(function ($qq) use ($request) {
                $qq->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->role, fn ($q) => $q->whereHas('roles', fn ($q2) => $q2->where('name', $request->role)))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $statBase = User::query();
        if (! $actor->isSuperAdmin()) {
            $statBase->where('corporation_id', $actor->corporation_id);
        }

        $stats = [
            'total' => (clone $statBase)->count(),
            'super_admins' => $actor->isSuperAdmin()
                ? (clone $statBase)->role(User::ROLE_SUPER_ADMIN)->count()
                : 0,
            'admins' => (clone $statBase)->role(User::ROLE_ADMIN)->count(),
            'auditors' => (clone $statBase)->role(User::ROLE_AUDITOR)->count(),
            'users' => (clone $statBase)->role(User::ROLE_USER)->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role']),
            'permissions' => [
                'is_super_admin' => $actor->isSuperAdmin(),
                'grantable_roles' => $this->grantableRoles($actor),
            ],
        ]);
    }

    public function create(Request $request)
    {
        $actor = $request->user();
        $grantable = $this->grantableRoles($actor);

        $roles = Role::whereIn('name', $grantable)->get();

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
            'corporations' => $actor->isSuperAdmin()
                ? Corporation::orderBy('name')->get(['id', 'name'])
                : [],
            'permissions' => [
                'is_super_admin' => $actor->isSuperAdmin(),
                'grantable_roles' => $grantable,
                'fixed_corporation_id' => $actor->isSuperAdmin() ? null : $actor->corporation_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $actor = $request->user();
        $grantable = $this->grantableRoles($actor);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', 'string', Rule::in($grantable)],
            'corporation_id' => $actor->isSuperAdmin()
                ? 'nullable|exists:corporations,id'
                : 'nullable',
        ]);

        // Resolve target corporation.
        if ($actor->isSuperAdmin()) {
            // super_admin chooses; super_admin role may be left tenant-less.
            $corporationId = $validated['role'] === User::ROLE_SUPER_ADMIN
                ? null
                : ($validated['corporation_id'] ?? null);
        } else {
            // corporation admin: always own corp, regardless of payload.
            $corporationId = $actor->corporation_id;
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'corporation_id' => $corporationId,
            'is_corporation_manager' => false,
        ]);

        $user->syncRoles([$validated['role']]);

        AuditLog::record('created', 'User', $user->id, "User '{$user->name}' created with role {$validated['role']}");

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function show(Request $request, User $user)
    {
        $this->ensureCanView($request->user(), $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user->load(['roles', 'corporation']),
            'roles' => $this->roleObjectsFor($request->user()),
            'currentRole' => $user->roles->pluck('name')->first() ?? $user->role,
            'permissions' => [
                'is_super_admin' => $request->user()->isSuperAdmin(),
                'grantable_roles' => $this->grantableRoles($request->user()),
            ],
        ]);
    }

    public function edit(Request $request, User $user)
    {
        $this->ensureCanView($request->user(), $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user->load(['roles', 'corporation']),
            'roles' => $this->roleObjectsFor($request->user()),
            'currentRole' => $user->roles->pluck('name')->first() ?? $user->role,
            'corporations' => $request->user()->isSuperAdmin()
                ? Corporation::orderBy('name')->get(['id', 'name'])
                : [],
            'permissions' => [
                'is_super_admin' => $request->user()->isSuperAdmin(),
                'grantable_roles' => $this->grantableRoles($request->user()),
                'fixed_corporation_id' => $request->user()->isSuperAdmin()
                    ? null
                    : $request->user()->corporation_id,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $actor = $request->user();
        $this->ensureCanModify($actor, $user);

        $grantable = $this->grantableRoles($actor);

        // Corp admins cannot promote a user to admin/super_admin, and cannot
        // demote an existing admin (canAdminister already blocks that).
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role' => ['required', 'string', Rule::in($grantable)],
            'password' => 'nullable|string|min:8|confirmed',
            'corporation_id' => $actor->isSuperAdmin()
                ? 'nullable|exists:corporations,id'
                : 'nullable',
        ]);

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if ($actor->isSuperAdmin()) {
            $payload['corporation_id'] = $validated['role'] === User::ROLE_SUPER_ADMIN
                ? null
                : ($validated['corporation_id'] ?? $user->corporation_id);
        }
        // corporation admin: must NOT be allowed to move target out of corp.

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);
        $user->syncRoles([$validated['role']]);

        AuditLog::record('updated', 'User', $user->id, "User '{$user->name}' updated with role {$validated['role']}");

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        $actor = $request->user();

        if ($user->id === $actor->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $this->ensureCanModify($actor, $user);

        $name = $user->name;
        $id = $user->id;
        $user->delete();

        AuditLog::record('deleted', 'User', $id, "User '{$name}' deleted");

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted.');
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function grantableRoles(User $actor): array
    {
        if ($actor->isSuperAdmin()) {
            return User::VALID_ROLES;
        }

        if ($actor->isAdmin()) {
            return self::CORP_ADMIN_GRANTABLE;
        }

        return [];
    }

    private function roleObjectsFor(User $actor)
    {
        return Role::whereIn('name', $this->grantableRoles($actor))->get();
    }

    private function ensureCanView(User $actor, User $target): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if (! $actor->isAdmin() || $target->corporation_id !== $actor->corporation_id) {
            abort(403);
        }
    }

    private function ensureCanModify(User $actor, User $target): void
    {
        if (! $actor->canAdminister($target)) {
            abort(403);
        }
    }
}
