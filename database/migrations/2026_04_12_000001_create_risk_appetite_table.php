<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_appetites', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(false);
            $table->unsignedInteger('acceptable_max_score');
            $table->unsignedInteger('review_max_score');
            $table->unsignedInteger('escalated_min_score');
            $table->string('acceptable_label')->default('Acceptable');
            $table->string('review_label')->default('Requires Review');
            $table->string('escalated_label')->default('Escalated');
            $table->string('acceptable_color')->default('green');
            $table->string('review_color')->default('amber');
            $table->string('escalated_color')->default('red');
            $table->boolean('notify_on_escalation')->default(true);
            $table->json('escalation_notification_roles')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Seed default record
        DB::table('risk_appetites')->insert([
            'name' => 'Default Risk Appetite',
            'is_active' => true,
            'acceptable_max_score' => 6,
            'review_max_score' => 14,
            'escalated_min_score' => 15,
            'acceptable_label' => 'Acceptable',
            'review_label' => 'Requires Review',
            'escalated_label' => 'Escalated',
            'acceptable_color' => 'green',
            'review_color' => 'amber',
            'escalated_color' => 'red',
            'notify_on_escalation' => true,
            'escalation_notification_roles' => json_encode(['admin', 'auditor']),
            'notes' => null,
            'created_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_appetites');
    }
};
