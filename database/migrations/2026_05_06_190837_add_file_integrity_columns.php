<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->string('upload_sha256', 64)->nullable()->after('file_type');
        });

        Schema::table('security_audits', function (Blueprint $table) {
            $table->string('upload_sha256', 64)->nullable()->after('file_path');
        });

        Schema::table('file_reputation_checks', function (Blueprint $table) {
            $table->string('integrity_status')->nullable()->after('status');
            $table->string('upload_sha256', 64)->nullable()->after('sha256');
        });
    }

    public function down(): void
    {
        Schema::table('evidence', function (Blueprint $table) {
            $table->dropColumn('upload_sha256');
        });

        Schema::table('security_audits', function (Blueprint $table) {
            $table->dropColumn('upload_sha256');
        });

        Schema::table('file_reputation_checks', function (Blueprint $table) {
            $table->dropColumn(['integrity_status', 'upload_sha256']);
        });
    }
};
