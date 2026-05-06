<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_reputation_checks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('checkable_type');
            $table->unsignedBigInteger('checkable_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('sha256', 64);
            $table->string('provider')->default('virustotal');
            $table->enum('status', [
                'clean',
                'suspicious',
                'malicious',
                'unknown',
                'not_found',
                'error',
                'pending',
            ]);
            $table->unsignedInteger('malicious_count')->default(0);
            $table->unsignedInteger('suspicious_count')->default(0);
            $table->unsignedInteger('undetected_count')->default(0);
            $table->unsignedInteger('harmless_count')->default(0);
            $table->unsignedInteger('timeout_count')->default(0);
            $table->timestamp('last_analysis_date')->nullable();
            $table->string('analysis_id')->nullable();
            $table->json('raw_summary_json')->nullable();
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();

            $table->index(['checkable_type', 'checkable_id']);
            $table->index('sha256');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_reputation_checks');
    }
};
