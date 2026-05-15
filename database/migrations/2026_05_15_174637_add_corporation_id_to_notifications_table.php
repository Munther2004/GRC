<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('corporation_id')
                ->nullable()
                ->after('user_id')
                ->constrained('corporations')
                ->cascadeOnDelete();

            $table->index(['corporation_id', 'is_read'], 'notif_corp_read_idx');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notif_corp_read_idx');
            $table->dropConstrainedForeignId('corporation_id');
        });
    }
};
