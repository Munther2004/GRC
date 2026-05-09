<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risks', function (Blueprint $table) {
            $table->foreignId('corporation_id')->nullable()->after('user_id')
                ->constrained('corporations')->onDelete('cascade');
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->foreignId('corporation_id')->nullable()->after('user_id')
                ->constrained('corporations')->onDelete('cascade');
        });

        Schema::table('remediation_tasks', function (Blueprint $table) {
            $table->foreignId('corporation_id')->nullable()->after('created_by')
                ->constrained('corporations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('risks', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['corporation_id']);
            $table->dropColumn('corporation_id');
        });
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['corporation_id']);
            $table->dropColumn('corporation_id');
        });
        Schema::table('remediation_tasks', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['corporation_id']);
            $table->dropColumn('corporation_id');
        });
    }
};
