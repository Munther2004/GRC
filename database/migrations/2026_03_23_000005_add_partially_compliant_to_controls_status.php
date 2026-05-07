<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite has no ENUM type and stores `current_status` as TEXT,
        // which already accepts any string — nothing to do there. Postgres
        // would need an ALTER TYPE ... ADD VALUE; we only target MySQL today.
        $driver = DB::connection()->getDriverName();
        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','partially_compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // Clear partially_compliant values before reverting
            DB::statement("UPDATE controls SET current_status = NULL WHERE current_status = 'partially_compliant'");
            DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
        }
    }
};
