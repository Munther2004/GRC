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
        Schema::table('corporations', function (Blueprint $table) {
            $table->string('manager_username')->nullable()->after('manager_user_id');
            $table->string('manager_password')->nullable()->after('manager_username');
            $table->boolean('credentials_sent')->default(false)->after('manager_password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('corporations', function (Blueprint $table) {
            $table->dropColumn(['manager_username', 'manager_password', 'credentials_sent']);
        });
    }
};
