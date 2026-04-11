<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_treatment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('risk_id')->constrained()->cascadeOnDelete();
            $table->enum('strategy', ['mitigate', 'accept', 'transfer', 'avoid']);
            $table->text('description');
            $table->string('owner');
            $table->date('due_date')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->unsignedTinyInteger('residual_likelihood')->nullable();
            $table->unsignedTinyInteger('residual_impact')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_treatment_plans');
    }
};
