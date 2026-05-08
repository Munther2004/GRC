import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/remediation-tasks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::index
* @see app/Http/Controllers/RemediationTaskController.php:17
* @route '/remediation-tasks'
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
* @see \App\Http\Controllers\RemediationTaskController::store
* @see app/Http/Controllers/RemediationTaskController.php:89
* @route '/remediation-tasks'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/remediation-tasks',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RemediationTaskController::store
* @see app/Http/Controllers/RemediationTaskController.php:89
* @route '/remediation-tasks'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RemediationTaskController::store
* @see app/Http/Controllers/RemediationTaskController.php:89
* @route '/remediation-tasks'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::store
* @see app/Http/Controllers/RemediationTaskController.php:89
* @route '/remediation-tasks'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::store
* @see app/Http/Controllers/RemediationTaskController.php:89
* @route '/remediation-tasks'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RemediationTaskController::update
* @see app/Http/Controllers/RemediationTaskController.php:123
* @route '/remediation-tasks/{task}'
*/
export const update = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/remediation-tasks/{task}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\RemediationTaskController::update
* @see app/Http/Controllers/RemediationTaskController.php:123
* @route '/remediation-tasks/{task}'
*/
update.url = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { task: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { task: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            task: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        task: typeof args.task === 'object'
        ? args.task.id
        : args.task,
    }

    return update.definition.url
            .replace('{task}', parsedArgs.task.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RemediationTaskController::update
* @see app/Http/Controllers/RemediationTaskController.php:123
* @route '/remediation-tasks/{task}'
*/
update.put = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::update
* @see app/Http/Controllers/RemediationTaskController.php:123
* @route '/remediation-tasks/{task}'
*/
const updateForm = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::update
* @see app/Http/Controllers/RemediationTaskController.php:123
* @route '/remediation-tasks/{task}'
*/
updateForm.put = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\RemediationTaskController::destroy
* @see app/Http/Controllers/RemediationTaskController.php:154
* @route '/remediation-tasks/{task}'
*/
export const destroy = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/remediation-tasks/{task}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RemediationTaskController::destroy
* @see app/Http/Controllers/RemediationTaskController.php:154
* @route '/remediation-tasks/{task}'
*/
destroy.url = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { task: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { task: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            task: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        task: typeof args.task === 'object'
        ? args.task.id
        : args.task,
    }

    return destroy.definition.url
            .replace('{task}', parsedArgs.task.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RemediationTaskController::destroy
* @see app/Http/Controllers/RemediationTaskController.php:154
* @route '/remediation-tasks/{task}'
*/
destroy.delete = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::destroy
* @see app/Http/Controllers/RemediationTaskController.php:154
* @route '/remediation-tasks/{task}'
*/
const destroyForm = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::destroy
* @see app/Http/Controllers/RemediationTaskController.php:154
* @route '/remediation-tasks/{task}'
*/
destroyForm.delete = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RemediationTaskController::complete
* @see app/Http/Controllers/RemediationTaskController.php:171
* @route '/remediation-tasks/{task}/complete'
*/
export const complete = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

complete.definition = {
    methods: ["post"],
    url: '/remediation-tasks/{task}/complete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RemediationTaskController::complete
* @see app/Http/Controllers/RemediationTaskController.php:171
* @route '/remediation-tasks/{task}/complete'
*/
complete.url = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { task: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { task: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            task: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        task: typeof args.task === 'object'
        ? args.task.id
        : args.task,
    }

    return complete.definition.url
            .replace('{task}', parsedArgs.task.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RemediationTaskController::complete
* @see app/Http/Controllers/RemediationTaskController.php:171
* @route '/remediation-tasks/{task}/complete'
*/
complete.post = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::complete
* @see app/Http/Controllers/RemediationTaskController.php:171
* @route '/remediation-tasks/{task}/complete'
*/
const completeForm = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RemediationTaskController::complete
* @see app/Http/Controllers/RemediationTaskController.php:171
* @route '/remediation-tasks/{task}/complete'
*/
completeForm.post = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, options),
    method: 'post',
})

complete.form = completeForm

const RemediationTaskController = { index, store, update, destroy, complete }

export default RemediationTaskController