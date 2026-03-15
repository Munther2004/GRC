<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('control_risk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('control_id')->constrained()->onDelete('cascade');
            $table->foreignId('risk_id')->constrained()->onDelete('cascade');
            $table->boolean('auto_linked')->default(true);
            $table->timestamps();

            $table->unique(['control_id', 'risk_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('control_risk');
    }
};
