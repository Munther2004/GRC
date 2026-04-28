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
            // Existing 'admin'/'auditor'/'user' values fit unchanged.
            DB::statement("ALTER TABLE users MODIFY role VARCHAR(32) NOT NULL DEFAULT 'user'");

            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(32)');
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'");

            return;
        }

        // SQLite (test): no ENUM type exists at column level — the original
        // migration's enum() emits a CHECK constraint. Rebuild the column.
        Schema::table('users', function ($table) {
            $table->string('role', 32)->default('user')->change();
        });
    }

    public function down(): void
    {
        // Down is intentionally a no-op: the new role values (super_admin)
        // would not fit the previous ENUM and would be silently truncated.
        // Re-running up() is safe.
    }
};
