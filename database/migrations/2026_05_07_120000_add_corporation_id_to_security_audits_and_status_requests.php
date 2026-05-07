<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3 of the security audit fix: give two tenant-owned tables a real
 * corporation_id column so we can scope queries directly instead of
 * joining through users.
 *
 * Backfill copies the corporation_id of the related user (the uploader for
 * security_audits, the requester for control_status_requests). Existing
 * rows whose user has no corporation will be left null and refused at
 * controller level.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('security_audits', function (Blueprint $table) {
            $table->foreignId('corporation_id')->nullable()->after('user_id')
                ->constrained('corporations')->onDelete('cascade');
            $table->index('corporation_id');
        });

        Schema::table('control_status_requests', function (Blueprint $table) {
            $table->foreignId('corporation_id')->nullable()->after('requested_by')
                ->constrained('corporations')->onDelete('cascade');
            $table->index('corporation_id');
        });

        // Backfill: lift corporation_id from the related user. Use raw SQL
        // because the tables/columns may differ across drivers and we don't
        // want to depend on Eloquent during a migration.
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement('UPDATE security_audits sa
                JOIN users u ON u.id = sa.user_id
                SET sa.corporation_id = u.corporation_id
                WHERE sa.corporation_id IS NULL');

            DB::statement('UPDATE control_status_requests csr
                JOIN users u ON u.id = csr.requested_by
                SET csr.corporation_id = u.corporation_id
                WHERE csr.corporation_id IS NULL');
        } else {
            // Portable form (SQLite/Postgres). Correlated subquery; slower
            // but only runs once per upgrade.
            DB::statement('UPDATE security_audits
                SET corporation_id = (
                    SELECT u.corporation_id FROM users u WHERE u.id = security_audits.user_id
                )
                WHERE corporation_id IS NULL');

            DB::statement('UPDATE control_status_requests
                SET corporation_id = (
                    SELECT u.corporation_id FROM users u WHERE u.id = control_status_requests.requested_by
                )
                WHERE corporation_id IS NULL');
        }
    }

    public function down(): void
    {
        Schema::table('security_audits', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['corporation_id']);
            $table->dropIndex(['corporation_id']);
            $table->dropColumn('corporation_id');
        });

        Schema::table('control_status_requests', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['corporation_id']);
            $table->dropIndex(['corporation_id']);
            $table->dropColumn('corporation_id');
        });
    }
};
