<?php

use App\Services\ControlDomainMapper;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('controls', function (Blueprint $table) {
            $table->string('domain', 64)->nullable()->after('category');
            $table->index('domain');
        });

        $rows = DB::table('controls')
            ->join('frameworks', 'controls.framework_id', '=', 'frameworks.id')
            ->select('controls.id', 'controls.control_id', 'controls.category', 'frameworks.short_name')
            ->get();

        foreach ($rows as $row) {
            $domain = ControlDomainMapper::for(
                (string) $row->short_name,
                (string) $row->control_id,
                (string) $row->category,
            );
            DB::table('controls')->where('id', $row->id)->update(['domain' => $domain]);
        }
    }

    public function down(): void
    {
        Schema::table('controls', function (Blueprint $table) {
            $table->dropIndex(['domain']);
            $table->dropColumn('domain');
        });
    }
};
