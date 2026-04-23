<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        if (! $request->user()) {
            abort(403, 'Unauthorized.');
        }

        $user = $request->user();

        foreach ($roles as $role) {
            if ($user->hasRole($role) || $user->role === $role) {
                return $next($request);
            }
        }

        abort(403, 'Unauthorized.');
    }
}
