import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/controls',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ControlController::index
 * @see app/Http/Controllers/Admin/ControlController.php:14
 * @route '/admin/controls'
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
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
export const edit = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/controls/{control}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
edit.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { control: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    control: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control: typeof args.control === 'object'
                ? args.control.id
                : args.control,
                }

    return edit.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
edit.get = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
edit.head = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
    const editForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
        editForm.get = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ControlController::edit
 * @see app/Http/Controllers/Admin/ControlController.php:44
 * @route '/admin/controls/{control}/edit'
 */
        editForm.head = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
export const update = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/controls/{control}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
update.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { control: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    control: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control: typeof args.control === 'object'
                ? args.control.id
                : args.control,
                }

    return update.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
update.put = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
update.patch = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
    const updateForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
        updateForm.put = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\ControlController::update
 * @see app/Http/Controllers/Admin/ControlController.php:52
 * @route '/admin/controls/{control}'
 */
        updateForm.patch = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Admin\ControlController::destroy
 * @see app/Http/Controllers/Admin/ControlController.php:70
 * @route '/admin/controls/{control}'
 */
export const destroy = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/controls/{control}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ControlController::destroy
 * @see app/Http/Controllers/Admin/ControlController.php:70
 * @route '/admin/controls/{control}'
 */
destroy.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { control: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    control: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control: typeof args.control === 'object'
                ? args.control.id
                : args.control,
                }

    return destroy.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ControlController::destroy
 * @see app/Http/Controllers/Admin/ControlController.php:70
 * @route '/admin/controls/{control}'
 */
destroy.delete = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ControlController::destroy
 * @see app/Http/Controllers/Admin/ControlController.php:70
 * @route '/admin/controls/{control}'
 */
    const destroyForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ControlController::destroy
 * @see app/Http/Controllers/Admin/ControlController.php:70
 * @route '/admin/controls/{control}'
 */
        destroyForm.delete = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const controls = {
    index: Object.assign(index, index),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default controls