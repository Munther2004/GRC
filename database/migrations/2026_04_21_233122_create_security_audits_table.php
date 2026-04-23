<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->string('file_path');
            $table->enum('status', ['pending', 'analyzing', 'completed', 'failed'])->default('pending');
            $table->json('findings')->nullable();
            $table->text('summary')->nullable();
            $table->unsignedInteger('total_findings')->default(0);
            $table->unsignedInteger('critical_count')->default(0);
            $table->unsignedInteger('high_count')->default(0);
            $table->unsignedInteger('medium_count')->default(0);
            $table->unsignedInteger('low_count')->default(0);
            $table->unsignedInteger('info_count')->default(0);
            $table->decimal('compliance_score', 5, 2)->nullable();
            $table->json('frameworks_checked')->nullable();
            $table->json('controls_referenced')->nullable();
            $table->foreignId('evidence_id')->nullable()->constrained('evidence')->nullOnDelete();
            $table->unsignedInteger('risks_generated')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('analyzed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_audits');
    }
};
