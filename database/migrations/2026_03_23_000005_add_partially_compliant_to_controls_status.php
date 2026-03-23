<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','partially_compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
    }

    public function down(): void
    {
        // Clear partially_compliant values before reverting
        DB::statement("UPDATE controls SET current_status = NULL WHERE current_status = 'partially_compliant'");
        DB::statement("ALTER TABLE controls MODIFY COLUMN current_status ENUM('compliant','non_compliant','not_applicable') NULL DEFAULT NULL");
    }
};
