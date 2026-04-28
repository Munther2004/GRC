<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risk_appetites', function (Blueprint $table) {
            // Nullable on purpose: the table was originally seeded with one
            // global default row before corporations existed. Existing rows
            // are left with corporation_id = NULL and ignored by per-corp
            // reads; corp-scoped reads only see rows belonging to a corp.
            $table->foreignId('corporation_id')
                ->nullable()
                ->after('id')
                ->constrained('corporations')
                ->cascadeOnDelete();
        });

        // Composite uniqueness: only one *active* appetite per corporation.
        // SQLite supports partial indexes; MySQL does not, so we keep this
        // soft-enforced in the controller (deactivate siblings on activate)
        // and only add a non-unique index here for read performance.
        Schema::table('risk_appetites', function (Blueprint $table) {
            $table->index(['corporation_id', 'is_active'], 'risk_appetites_corp_active_idx');
        });

        // Mark the legacy seeded global row inactive so it stops being
        // returned by the per-corporation getActive() lookup. The row is
        // preserved (rather than deleted) for audit.
        DB::table('risk_appetites')
            ->whereNull('corporation_id')
            ->update(['is_active' => false]);
    }

    public function down(): void
    {
        Schema::table('risk_appetites', function (Blueprint $table) {
            $table->dropIndex('risk_appetites_corp_active_idx');
            $table->dropForeign(['corporation_id']);
            $table->dropColumn('corporation_id');
        });
    }
};
