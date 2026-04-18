<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // Define permissions for user management
        $permissions = [
            // Admin permissions
            'view_users' => 'View users',
            'create_user' => 'Create new users',
            'edit_user' => 'Edit users',
            'delete_user' => 'Delete users',
            'manage_permissions' => 'Manage user permissions',
            'access_admin_dashboard' => 'Access admin dashboard',

            // Control permissions
            'edit_control' => 'Edit controls',
            'delete_control' => 'Delete controls',

            // Framework permissions
            'manage_frameworks' => 'Manage frameworks',

            // Risk permissions
            'create_risk' => 'Create risks',
            'edit_risk' => 'Edit risks',
            'delete_risk' => 'Delete risks',
            'approve_risk' => 'Approve risks',

            // Assessment permissions
            'create_assessment' => 'Create assessments',
            'edit_assessment' => 'Edit assessments',
            'delete_assessment' => 'Delete assessments',

            // Evidence permissions
            'approve_evidence' => 'Approve evidence',
            'reject_evidence' => 'Reject evidence',
            'delete_evidence' => 'Delete evidence',

            // Audit permissions
            'view_audit_logs' => 'View audit logs',

            // Risk appetite permissions
            'manage_risk_appetite' => 'Manage risk appetite',
        ];

        // Create all permissions
        foreach ($permissions as $permission => $label) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $auditorRole = Role::firstOrCreate(['name' => 'auditor']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        // Assign all permissions to admin
        $adminRole->syncPermissions(Permission::all());

        // Assign auditor permissions
        $auditorRole->syncPermissions([
            'view_users',
            'view_audit_logs',
            'approve_evidence',
            'reject_evidence',
        ]);

        // Assign manager permissions (can manage team and oversee operations)
        $managerRole->syncPermissions([
            'view_users',
            'view_audit_logs',
            'create_risk',
            'edit_risk',
            'delete_risk',
            'approve_risk',
            'create_assessment',
            'edit_assessment',
            'delete_assessment',
            'approve_evidence',
            'reject_evidence',
            'manage_risk_appetite',
        ]);

        // Assign employee permissions (can create and manage their own items)
        $employeeRole->syncPermissions([
            'create_risk',
            'edit_risk',
            'delete_risk',
            'create_assessment',
            'edit_assessment',
            'delete_assessment',
        ]);
    }
}
