<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['is_read', 'type'], 'notifications_is_read_type_index');
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->index(['status', 'due_date'], 'assessments_status_due_date_index');
        });

        Schema::table('evidence', function (Blueprint $table) {
            $table->index(['status', 'expiry_date'], 'evidence_status_expiry_date_index');
        });

        Schema::table('remediation_tasks', function (Blueprint $table) {
            $table->index(['status', 'due_date'], 'remediation_tasks_status_due_date_index');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_is_read_type_index');
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropIndex('assessments_status_due_date_index');
        });

        Schema::table('evidence', function (Blueprint $table) {
            $table->dropIndex('evidence_status_expiry_date_index');
        });

        Schema::table('remediation_tasks', function (Blueprint $table) {
            $table->dropIndex('remediation_tasks_status_due_date_index');
        });
    }
};
