<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The original `assessments.status` column was an ENUM accepting only
     * draft/in_progress/submitted/completed. The deletion flow in
     * AssessmentController writes a tombstone value `'deleting'` so that in-
     * flight AIRiskGenerator jobs see the marker and abort instead of writing
     * risks to a row that's about to disappear. Without this widening, MySQL
     * raises `1265 Data truncated for column 'status'` on the update and the
     * deletion fails outright.
     *
     * Switching to VARCHAR(32) keeps every existing value byte-identical and
     * also leaves room for any future status without another schema change.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE assessments MODIFY status VARCHAR(32) NOT NULL DEFAULT 'draft'");

            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE assessments ALTER COLUMN status TYPE VARCHAR(32)');
            DB::statement("ALTER TABLE assessments ALTER COLUMN status SET DEFAULT 'draft'");

            return;
        }

        // SQLite (test): the original enum() emits a CHECK constraint;
        // ->change() rebuilds the column without it.
        Schema::table('assessments', function ($table) {
            $table->string('status', 32)->default('draft')->change();
        });
    }

    public function down(): void
    {
        // Down is intentionally a no-op: any 'deleting' rows present would
        // not fit the previous ENUM and would be silently truncated. The
        // up() migration is idempotent so re-running it is safe.
    }
};
