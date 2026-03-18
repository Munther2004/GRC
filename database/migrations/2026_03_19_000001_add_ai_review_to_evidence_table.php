<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->json('ai_review')->nullable()->after('status');
            $table->string('ai_verdict')->nullable()->after('ai_review');
            $table->unsignedTinyInteger('ai_confidence')->nullable()->after('ai_verdict');
            $table->timestamp('ai_reviewed_at')->nullable()->after('ai_confidence');
        });
    }

    public function down(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->dropColumn(['ai_review', 'ai_verdict', 'ai_confidence', 'ai_reviewed_at']);
        });
    }
};
