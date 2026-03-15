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
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('owner')->nullable();
            $table->integer('likelihood')->default(1);
            $table->integer('impact')->default(1);
            $table->integer('risk_score')->virtualAs('likelihood * impact');
            $table->enum('status', ['open', 'in_progress', 'under_review', 'closed'])->default('open');
            $table->enum('treatment', ['accept', 'mitigate', 'transfer', 'avoid'])->nullable();
            $table->text('treatment_plan')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('risks');
    }
};
