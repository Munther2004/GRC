<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            // Change ai_confidence from unsignedTinyInteger (0-100) to varchar for High/Medium/Low
            $table->string('ai_confidence', 20)->nullable()->change();

            // New structured verdict columns
            $table->text('ai_strengths')->nullable()->after('ai_reviewed_at');
            $table->text('ai_gaps')->nullable()->after('ai_strengths');
            $table->text('ai_recommendation')->nullable()->after('ai_gaps');
        });
    }

    public function down(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->dropColumn(['ai_strengths', 'ai_gaps', 'ai_recommendation']);
            $table->unsignedTinyInteger('ai_confidence')->nullable()->change();
        });
    }
};
