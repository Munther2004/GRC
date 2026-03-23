<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kri_snapshots', function (Blueprint $table) {
            $table->id();
            $table->date('snapshot_date')->unique();
            $table->decimal('compliance_percentage', 5, 2)->default(0);
            $table->integer('open_risks_critical')->default(0);
            $table->integer('open_risks_high')->default(0);
            $table->integer('open_risks_medium')->default(0);
            $table->integer('open_risks_low')->default(0);
            $table->integer('overdue_risks')->default(0);
            $table->integer('overdue_assessments')->default(0);
            $table->decimal('evidence_approval_rate', 5, 2)->default(0);
            $table->integer('ai_generated_risks')->default(0);
            $table->integer('total_risks')->default(0);
            $table->integer('total_controls')->default(0);
            $table->integer('compliant_controls')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kri_snapshots');
    }
};
