<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('control_crosswalk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('primary_control_id')->constrained('controls')->cascadeOnDelete();
            $table->foreignId('mapped_control_id')->constrained('controls')->cascadeOnDelete();
            $table->enum('mapping_type', ['equivalent', 'partial', 'related'])->default('related');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['primary_control_id', 'mapped_control_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('control_crosswalk');
    }
};
