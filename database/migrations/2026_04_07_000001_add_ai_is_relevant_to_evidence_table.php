<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->boolean('ai_is_relevant')->nullable()->after('ai_recommendation');
        });
    }

    public function down(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->dropColumn('ai_is_relevant');
        });
    }
};
