<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','partially_compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
        } else {
            Schema::table('controls', function (Blueprint $table) {
                $table->dropColumn('current_status');
            });
            Schema::table('controls', function (Blueprint $table) {
                $table->enum('current_status', ['compliant', 'partially_compliant', 'non_compliant', 'not_applicable'])
                    ->nullable()
                    ->default(null)
                    ->after('is_active');
            });
        }
    }

    public function down(): void
    {
        DB::statement("UPDATE controls SET current_status = NULL WHERE current_status = 'partially_compliant'");

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
        } else {
            Schema::table('controls', function (Blueprint $table) {
                $table->dropColumn('current_status');
            });
            Schema::table('controls', function (Blueprint $table) {
                $table->enum('current_status', ['compliant', 'non_compliant', 'not_applicable'])
                    ->nullable()
                    ->default(null)
                    ->after('is_active');
            });
        }
    }
};
