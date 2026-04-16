<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->role, fn ($q) => $q->whereHas('roles', fn ($q2) => $q2->where('name', $request->role))
            )
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => User::count(),
            'admins' => User::role('admin')->count(),
            'auditors' => User::role('auditor')->count(),
            'users' => User::role('user')->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign roles to user
        $roleIds = $validated['roles'];
        $roles = Role::whereIn('id', $roleIds)->get();
        $user->syncRoles($roles);

        $roleNames = $roles->pluck('name')->join(', ');
        AuditLog::record('created', 'User', $user->id, "User '{$user->name}' created with roles: {$roleNames}");

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user->load('roles'),
            'roles' => Role::all(),
            'userRoles' => $user->roles->pluck('id')->toArray(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            ...($validated['password'] ? ['password' => Hash::make($validated['password'])] : []),
        ]);

        // Sync roles to user
        $roleIds = $validated['roles'];
        $roles = Role::whereIn('id', $roleIds)->get();
        $user->syncRoles($roles);

        $roleNames = $roles->pluck('name')->join(', ');
        AuditLog::record('updated', 'User', $user->id, "User '{$user->name}' updated with roles: {$roleNames}");

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $name = $user->name;
        $id = $user->id;
        $user->delete();

        AuditLog::record('deleted', 'User', $id, "User '{$name}' deleted");

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted.');
    }
}
