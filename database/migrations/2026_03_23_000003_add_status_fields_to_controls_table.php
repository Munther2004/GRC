<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('controls', function (Blueprint $table) {
            $table->enum('current_status', ['compliant', 'non_compliant', 'not_applicable'])
                  ->nullable()
                  ->default(null)
                  ->after('is_active');
            $table->timestamp('last_remediated_at')->nullable()->after('current_status');
            $table->text('remediation_notes')->nullable()->after('last_remediated_at');
        });
    }

    public function down(): void
    {
        Schema::table('controls', function (Blueprint $table) {
            $table->dropColumn(['current_status', 'last_remediated_at', 'remediation_notes']);
        });
    }
};
