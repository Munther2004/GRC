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
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('framework_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('scope')->nullable();
            $table->string('period')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('status', ['draft', 'in_progress', 'submitted', 'completed'])->default('draft');
            $table->decimal('compliance_percentage', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
