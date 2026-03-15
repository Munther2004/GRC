<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risks', function (Blueprint $table) {
            $table->tinyInteger('auto_generated')->default(0)->after('treatment_plan');
            $table->unsignedBigInteger('source_control_id')->nullable()->after('auto_generated');
            $table->text('mitigation_steps')->nullable()->after('source_control_id');

            $table->foreign('source_control_id')->references('id')->on('controls')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('risks', function (Blueprint $table) {
            $table->dropForeign(['source_control_id']);
            $table->dropColumn(['auto_generated', 'source_control_id', 'mitigation_steps']);
        });
    }
};
