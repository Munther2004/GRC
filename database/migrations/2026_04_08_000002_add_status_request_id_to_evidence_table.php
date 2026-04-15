<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->foreignId('control_status_request_id')
                ->nullable()
                ->constrained('control_status_requests')
                ->nullOnDelete()
                ->after('control_id');
        });
    }

    public function down(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->dropForeign(['control_status_request_id']);
            $table->dropColumn('control_status_request_id');
        });
    }
};
