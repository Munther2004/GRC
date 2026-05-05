<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            // ENUM cannot grow without a full rewrite; switch to VARCHAR.
            // Existing 'draft'/'in_progress'/'submitted'/'completed' values fit unchanged.
            DB::statement("ALTER TABLE assessments MODIFY status VARCHAR(32) NOT NULL DEFAULT 'draft'");

            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE assessments ALTER COLUMN status TYPE VARCHAR(32)');
            DB::statement("ALTER TABLE assessments ALTER COLUMN status SET DEFAULT 'draft'");

            return;
        }

        // SQLite (test): no ENUM type exists at column level — the original
        // migration's enum() emits a CHECK constraint. Rebuild the column.
        Schema::table('assessments', function ($table) {
            $table->string('status', 32)->default('draft')->change();
        });
    }

    public function down(): void
    {
        // Down is intentionally a no-op: 'deleting' would not fit the previous
        // ENUM and would be silently truncated. Re-running up() is safe.
    }
};
