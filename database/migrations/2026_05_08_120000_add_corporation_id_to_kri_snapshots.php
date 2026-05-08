<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kri_snapshots', function (Blueprint $table) {
            $table->foreignId('corporation_id')
                ->nullable()
                ->after('id')
                ->constrained('corporations')
                ->cascadeOnDelete();
        });

        // The original (snapshot_date) UNIQUE constraint blocks per-tenant
        // snapshots on the same day. Drop it and replace with the composite
        // key. Driver-aware so the SQLite test runner doesn't choke.
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql' || $driver === 'mariadb') {
            try {
                Schema::table('kri_snapshots', function (Blueprint $table) {
                    $table->dropUnique(['snapshot_date']);
                });
            } catch (\Throwable $e) {
                // index name may differ in older deployments; fall through
            }
        } elseif ($driver === 'pgsql') {
            try {
                Schema::table('kri_snapshots', function (Blueprint $table) {
                    $table->dropUnique('kri_snapshots_snapshot_date_unique');
                });
            } catch (\Throwable $e) {
                // ignore
            }
        }
        // SQLite: leaving the legacy unique alone — tests don't take real snapshots.

        Schema::table('kri_snapshots', function (Blueprint $table) {
            $table->unique(['corporation_id', 'snapshot_date'], 'kri_snapshots_corp_date_unique');
        });
    }

    public function down(): void
    {
        Schema::table('kri_snapshots', function (Blueprint $table) {
            $table->dropUnique('kri_snapshots_corp_date_unique');
        });

        Schema::table('kri_snapshots', function (Blueprint $table) {
            $table->dropConstrainedForeignId('corporation_id');
        });

        Schema::table('kri_snapshots', function (Blueprint $table) {
            $table->unique(['snapshot_date']);
        });
    }
};
