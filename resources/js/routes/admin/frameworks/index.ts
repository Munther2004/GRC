import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FrameworkController::toggle
* @see app/Http/Controllers/Admin/FrameworkController.php:22
* @route '/admin/frameworks/{framework}/toggle'
*/
export const toggle = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/admin/frameworks/{framework}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FrameworkController::toggle
* @see app/Http/Controllers/Admin/FrameworkController.php:22
* @route '/admin/frameworks/{framework}/toggle'
*/
toggle.url = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { framework: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { framework: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            framework: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        framework: typeof args.framework === 'object'
        ? args.framework.id
        : args.framework,
    }

    return toggle.definition.url
            .replace('{framework}', parsedArgs.framework.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrameworkController::toggle
* @see app/Http/Controllers/Admin/FrameworkController.php:22
* @route '/admin/frameworks/{framework}/toggle'
*/
toggle.post = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::toggle
* @see app/Http/Controllers/Admin/FrameworkController.php:22
* @route '/admin/frameworks/{framework}/toggle'
*/
const toggleForm = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::toggle
* @see app/Http/Controllers/Admin/FrameworkController.php:22
* @route '/admin/frameworks/{framework}/toggle'
*/
toggleForm.post = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

toggle.form = toggleForm

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/frameworks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::index
* @see app/Http/Controllers/Admin/FrameworkController.php:13
* @route '/admin/frameworks'
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
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
export const edit = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/frameworks/{framework}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
edit.url = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { framework: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { framework: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            framework: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        framework: typeof args.framework === 'object'
        ? args.framework.id
        : args.framework,
    }

    return edit.definition.url
            .replace('{framework}', parsedArgs.framework.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
edit.get = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
edit.head = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
const editForm = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
editForm.get = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::edit
* @see app/Http/Controllers/Admin/FrameworkController.php:36
* @route '/admin/frameworks/{framework}/edit'
*/
editForm.head = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
export const update = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/frameworks/{framework}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
update.url = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { framework: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { framework: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            framework: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        framework: typeof args.framework === 'object'
        ? args.framework.id
        : args.framework,
    }

    return update.definition.url
            .replace('{framework}', parsedArgs.framework.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
update.put = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
update.patch = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
const updateForm = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
updateForm.put = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FrameworkController::update
* @see app/Http/Controllers/Admin/FrameworkController.php:43
* @route '/admin/frameworks/{framework}'
*/
updateForm.patch = (args: { framework: number | { id: number } } | [framework: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const frameworks = {
    toggle: Object.assign(toggle, toggle),
    index: Object.assign(index, index),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
}

export default frameworks