<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Final RBAC: four roles only.
     *
     *   super_admin — platform owner. All permissions, all corporations.
     *   admin       — corporation administrator. Tenant-scoped at query level.
     *   auditor     — corporation auditor / reviewer. Read + approval only.
     *   user        — normal corporation user. Operational write within corp.
     *
     * manager / employee / corporate_manager are not final roles. The
     * remap_legacy_rbac_roles migration moves any legacy assignments off
     * those roles before this seeder runs in normal flow.
     */
    public function run(): void
    {
        app()['cache']->forget('spatie.permission.cache');

        $permissions = [
            // Platform-level
            'manage_corporations' => 'Approve / reject / list corporations',
            'manage_frameworks' => 'Manage global framework definitions',
            'manage_controls_library' => 'Manage global control definitions',
            'access_admin_dashboard' => 'Access platform admin dashboard',

            // User management
            'view_users' => 'View users',
            'create_user' => 'Create new users',
            'edit_user' => 'Edit users',
            'delete_user' => 'Delete users',
            'manage_permissions' => 'Manage user permissions',

            // Risk
            'create_risk' => 'Create risks',
            'edit_risk' => 'Edit risks',
            'delete_risk' => 'Delete risks',
            'approve_risk' => 'Approve risks',
            'link_risk_control' => 'Link / unlink risks to controls',

            // Assessment
            'create_assessment' => 'Create assessments',
            'edit_assessment' => 'Edit assessments',
            'delete_assessment' => 'Delete assessments',

            // Evidence
            'upload_evidence' => 'Upload evidence',
            'approve_evidence' => 'Approve evidence',
            'reject_evidence' => 'Reject evidence',
            'delete_evidence' => 'Delete evidence',

            // Operational
            'request_control_status' => 'Submit a control status change request',
            'manage_remediation_tasks' => 'Create / update remediation tasks',
            'use_ai_assistance' => 'Use AI helpers (suggest threats, gap remediation)',

            // Review
            'review_status_requests' => 'Review control status change requests',
            'view_audit_logs' => 'View audit logs',

            // Risk appetite
            'manage_risk_appetite' => 'Manage corporation risk appetite',
        ];

        foreach ($permissions as $name => $_label) {
            Permission::firstOrCreate(['name' => $name]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $auditor = Role::firstOrCreate(['name' => 'auditor']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // super_admin: everything.
        $superAdmin->syncPermissions(Permission::all());

        // admin: corporation administration + the operational set so org
        // admins can do anything a normal user can within their tenant.
        $admin->syncPermissions([
            'access_admin_dashboard',
            'view_users',
            'create_user',
            'edit_user',
            'delete_user',
            'view_audit_logs',
            'create_risk',
            'edit_risk',
            'delete_risk',
            'approve_risk',
            'link_risk_control',
            'create_assessment',
            'edit_assessment',
            'delete_assessment',
            'upload_evidence',
            'approve_evidence',
            'reject_evidence',
            'delete_evidence',
            'request_control_status',
            'manage_remediation_tasks',
            'use_ai_assistance',
            'review_status_requests',
            'manage_risk_appetite',
        ]);

        // auditor: review-only.
        $auditor->syncPermissions([
            'view_users',
            'view_audit_logs',
            'approve_evidence',
            'reject_evidence',
            'review_status_requests',
        ]);

        // user: operational write within their corporation.
        $user->syncPermissions([
            'create_risk',
            'edit_risk',
            'delete_risk',
            'create_assessment',
            'edit_assessment',
            'delete_assessment',
            'upload_evidence',
            'request_control_status',
            'manage_remediation_tasks',
            'use_ai_assistance',
        ]);
    }
}
