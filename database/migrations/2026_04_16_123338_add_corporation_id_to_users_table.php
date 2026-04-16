<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('corporation_id')->nullable()->after('role')->constrained('corporations')->onDelete('set null');
            $table->boolean('is_corporation_manager')->default(false)->after('corporation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['corporation_id']);
            $table->dropColumn(['corporation_id', 'is_corporation_manager']);
        });
    }
};
