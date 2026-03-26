<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('controls', function (Blueprint $table) {
                $table->string('current_status')->nullable()->default(null)->change();
            });

            return;
        }

        DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','partially_compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
    }

    public function down(): void
    {
        // Clear partially_compliant values before reverting
        DB::statement("UPDATE controls SET current_status = NULL WHERE current_status = 'partially_compliant'");

        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('controls', function (Blueprint $table) {
                $table->enum('current_status', ['compliant', 'non_compliant', 'not_applicable'])->nullable()->default(null)->change();
            });

            return;
        }

        DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
    }
};
