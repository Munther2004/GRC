<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Repair migration: the Phase 3 migration that adds corporation_id to
 * control_status_requests was marked as run on some databases but the
 * column never landed (only the security_audits half applied). This adds
 * it idempotently and backfills from the requester user's corporation.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('control_status_requests', 'corporation_id')) {
            Schema::table('control_status_requests', function (Blueprint $table) {
                $table->foreignId('corporation_id')->nullable()->after('requested_by')
                    ->constrained('corporations')->onDelete('cascade');
                $table->index('corporation_id');
            });

            $driver = DB::connection()->getDriverName();

            if ($driver === 'mysql' || $driver === 'mariadb') {
                DB::statement('UPDATE control_status_requests csr
                    JOIN users u ON u.id = csr.requested_by
                    SET csr.corporation_id = u.corporation_id
                    WHERE csr.corporation_id IS NULL');
            } else {
                DB::statement('UPDATE control_status_requests
                    SET corporation_id = (
                        SELECT u.corporation_id FROM users u WHERE u.id = control_status_requests.requested_by
                    )
                    WHERE corporation_id IS NULL');
            }
        }
    }

    public function down(): void
    {
        // No-op: leaving the column in place is safe even if rolled back.
    }
};
