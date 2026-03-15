<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLog extends Model
{
    protected $fillable = ['user_id', 'user_name', 'action', 'model_type', 'model_id', 'description', 'ip_address'];

    public function user() { return $this->belongsTo(User::class); }

    public static function record(
        string $action,
        string $modelType,
        int $modelId,
        string $description = ''
    ): void {
        static::create([
            'user_id'    => Auth::id(),
            'user_name'  => Auth::user()?->name ?? 'System',
            'action'     => $action,
            'model_type' => $modelType,
            'model_id'   => $modelId,
            'description'=> $description,
            'ip_address' => request()->ip(),
        ]);
    }
}