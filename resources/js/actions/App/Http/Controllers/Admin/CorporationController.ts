import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/corporations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\CorporationController::index
 * @see app/Http/Controllers/Admin/CorporationController.php:25
 * @route '/admin/corporations'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
export const show = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/corporations/{corporation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
show.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { corporation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { corporation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    corporation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        corporation: typeof args.corporation === 'object'
                ? args.corporation.id
                : args.corporation,
                }

    return show.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
show.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
show.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
    const showForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
        showForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\CorporationController::show
 * @see app/Http/Controllers/Admin/CorporationController.php:51
 * @route '/admin/corporations/{corporation}'
 */
        showForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Admin\CorporationController::destroy
 * @see app/Http/Controllers/Admin/CorporationController.php:148
 * @route '/admin/corporations/{corporation}'
 */
export const destroy = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/corporations/{corporation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\CorporationController::destroy
 * @see app/Http/Controllers/Admin/CorporationController.php:148
 * @route '/admin/corporations/{corporation}'
 */
destroy.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { corporation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { corporation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    corporation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        corporation: typeof args.corporation === 'object'
                ? args.corporation.id
                : args.corporation,
                }

    return destroy.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CorporationController::destroy
 * @see app/Http/Controllers/Admin/CorporationController.php:148
 * @route '/admin/corporations/{corporation}'
 */
destroy.delete = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\CorporationController::destroy
 * @see app/Http/Controllers/Admin/CorporationController.php:148
 * @route '/admin/corporations/{corporation}'
 */
    const destroyForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\CorporationController::destroy
 * @see app/Http/Controllers/Admin/CorporationController.php:148
 * @route '/admin/corporations/{corporation}'
 */
        destroyForm.delete = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\Admin\CorporationController::approve
 * @see app/Http/Controllers/Admin/CorporationController.php:68
 * @route '/admin/corporations/{corporation}/approve'
 */
export const approve = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/corporations/{corporation}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CorporationController::approve
 * @see app/Http/Controllers/Admin/CorporationController.php:68
 * @route '/admin/corporations/{corporation}/approve'
 */
approve.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { corporation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { corporation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    corporation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        corporation: typeof args.corporation === 'object'
                ? args.corporation.id
                : args.corporation,
                }

    return approve.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CorporationController::approve
 * @see app/Http/Controllers/Admin/CorporationController.php:68
 * @route '/admin/corporations/{corporation}/approve'
 */
approve.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\CorporationController::approve
 * @see app/Http/Controllers/Admin/CorporationController.php:68
 * @route '/admin/corporations/{corporation}/approve'
 */
    const approveForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\CorporationController::approve
 * @see app/Http/Controllers/Admin/CorporationController.php:68
 * @route '/admin/corporations/{corporation}/approve'
 */
        approveForm.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\CorporationController::reject
 * @see app/Http/Controllers/Admin/CorporationController.php:122
 * @route '/admin/corporations/{corporation}/reject'
 */
export const reject = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/corporations/{corporation}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CorporationController::reject
 * @see app/Http/Controllers/Admin/CorporationController.php:122
 * @route '/admin/corporations/{corporation}/reject'
 */
reject.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { corporation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { corporation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    corporation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        corporation: typeof args.corporation === 'object'
                ? args.corporation.id
                : args.corporation,
                }

    return reject.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CorporationController::reject
 * @see app/Http/Controllers/Admin/CorporationController.php:122
 * @route '/admin/corporations/{corporation}/reject'
 */
reject.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\CorporationController::reject
 * @see app/Http/Controllers/Admin/CorporationController.php:122
 * @route '/admin/corporations/{corporation}/reject'
 */
    const rejectForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\CorporationController::reject
 * @see app/Http/Controllers/Admin/CorporationController.php:122
 * @route '/admin/corporations/{corporation}/reject'
 */
        rejectForm.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\Admin\CorporationController::regenerateCode
 * @see app/Http/Controllers/Admin/CorporationController.php:135
 * @route '/admin/corporations/{corporation}/regenerate-code'
 */
export const regenerateCode = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateCode.url(args, options),
    method: 'post',
})

regenerateCode.definition = {
    methods: ["post"],
    url: '/admin/corporations/{corporation}/regenerate-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CorporationController::regenerateCode
 * @see app/Http/Controllers/Admin/CorporationController.php:135
 * @route '/admin/corporations/{corporation}/regenerate-code'
 */
regenerateCode.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { corporation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { corporation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    corporation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        corporation: typeof args.corporation === 'object'
                ? args.corporation.id
                : args.corporation,
                }

    return regenerateCode.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CorporationController::regenerateCode
 * @see app/Http/Controllers/Admin/CorporationController.php:135
 * @route '/admin/corporations/{corporation}/regenerate-code'
 */
regenerateCode.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateCode.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\CorporationController::regenerateCode
 * @see app/Http/Controllers/Admin/CorporationController.php:135
 * @route '/admin/corporations/{corporation}/regenerate-code'
 */
    const regenerateCodeForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: regenerateCode.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\CorporationController::regenerateCode
 * @see app/Http/Controllers/Admin/CorporationController.php:135
 * @route '/admin/corporations/{corporation}/regenerate-code'
 */
        regenerateCodeForm.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: regenerateCode.url(args, options),
            method: 'post',
        })
    
    regenerateCode.form = regenerateCodeForm
const CorporationController = { index, show, destroy, approve, reject, regenerateCode }

export default CorporationController