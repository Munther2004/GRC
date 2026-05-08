<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Per-tenant control-status pivot.
 *
 * controls.current_status used to be the single source of truth for "is this
 * control compliant", which leaked across tenants — when corp A approved a
 * status request, corp B saw the new status. From now on tenants override
 * control state via this pivot; reads route through it (with the global
 * controls.current_status acting as the seeded default for unmodified
 * (tenant, control) pairs).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('corporation_control_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('corporation_id')->constrained('corporations')->cascadeOnDelete();
            $table->foreignId('control_id')->constrained('controls')->cascadeOnDelete();
            $table->string('current_status', 32)->nullable();
            $table->timestamp('last_remediated_at')->nullable();
            $table->text('remediation_notes')->nullable();
            $table->timestamps();

            $table->unique(['corporation_id', 'control_id'], 'corp_control_status_unique');
            $table->index(['corporation_id', 'current_status'], 'corp_control_status_idx');
        });

        // Backfill: every existing corporation inherits the legacy global
        // status as its starting per-tenant state. Without this, the first
        // tenant that opens the dashboard after deploy would see "not_set"
        // for every control even if the global field has a value.
        $controls = DB::table('controls')
            ->whereNotNull('current_status')
            ->select('id', 'current_status', 'last_remediated_at', 'remediation_notes')
            ->get();

        if ($controls->isEmpty()) {
            return;
        }

        $corporationIds = DB::table('corporations')->pluck('id');
        if ($corporationIds->isEmpty()) {
            return;
        }

        $now = now();
        foreach ($corporationIds->chunk(50) as $corpChunk) {
            $rows = [];
            foreach ($corpChunk as $corpId) {
                foreach ($controls as $control) {
                    $rows[] = [
                        'corporation_id' => $corpId,
                        'control_id' => $control->id,
                        'current_status' => $control->current_status,
                        'last_remediated_at' => $control->last_remediated_at,
                        'remediation_notes' => $control->remediation_notes,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
                if (count($rows) >= 1000) {
                    DB::table('corporation_control_statuses')->insert($rows);
                    $rows = [];
                }
            }
            if ($rows) {
                DB::table('corporation_control_statuses')->insert($rows);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('corporation_control_statuses');
    }
};
