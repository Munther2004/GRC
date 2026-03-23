<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->foreignId('control_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete()
                  ->after('assessment_item_id');
        });
    }

    public function down(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->dropForeign(['control_id']);
            $table->dropColumn('control_id');
        });
    }
};
