<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('security_audits', function (Blueprint $table) {
            $table->foreignId('corporation_id')
                ->nullable()
                ->after('user_id')
                ->constrained('corporations')
                ->nullOnDelete();

            $table->index(['corporation_id', 'status']);
        });

        // Backfill from each row's uploader → users.corporation_id.
        // Driver-aware: MySQL/MariaDB use UPDATE ... JOIN, others use a correlated subquery.
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement('
                UPDATE security_audits sa
                JOIN users u ON u.id = sa.user_id
                SET sa.corporation_id = u.corporation_id
                WHERE sa.corporation_id IS NULL
            ');
        } else {
            DB::statement('
                UPDATE security_audits
                SET corporation_id = (SELECT corporation_id FROM users WHERE users.id = security_audits.user_id)
                WHERE corporation_id IS NULL
            ');
        }
    }

    public function down(): void
    {
        Schema::table('security_audits', function (Blueprint $table) {
            $table->dropIndex(['corporation_id', 'status']);
            $table->dropConstrainedForeignId('corporation_id');
        });
    }
};
