<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_audit_findings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('security_audit_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('finding_number');
            $table->enum('severity', ['critical', 'high', 'medium', 'low', 'info']);
            $table->string('title');
            $table->text('description');
            $table->string('affected_item')->nullable();
            $table->text('recommendation');
            $table->string('control_reference')->nullable();
            $table->foreignId('control_id')->nullable()->constrained('controls')->nullOnDelete();
            $table->text('compliance_impact')->nullable();
            $table->foreignId('risk_id')->nullable()->constrained('risks')->nullOnDelete();
            $table->timestamps();

            $table->index(['security_audit_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_audit_findings');
    }
};
