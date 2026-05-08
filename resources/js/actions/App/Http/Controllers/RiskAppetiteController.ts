import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/risk-appetite',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::index
* @see app/Http/Controllers/RiskAppetiteController.php:18
* @route '/risk-appetite'
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
* @see \App\Http\Controllers\RiskAppetiteController::store
* @see app/Http/Controllers/RiskAppetiteController.php:54
* @route '/risk-appetite'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/risk-appetite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskAppetiteController::store
* @see app/Http/Controllers/RiskAppetiteController.php:54
* @route '/risk-appetite'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskAppetiteController::store
* @see app/Http/Controllers/RiskAppetiteController.php:54
* @route '/risk-appetite'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::store
* @see app/Http/Controllers/RiskAppetiteController.php:54
* @route '/risk-appetite'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::store
* @see app/Http/Controllers/RiskAppetiteController.php:54
* @route '/risk-appetite'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RiskAppetiteController::update
* @see app/Http/Controllers/RiskAppetiteController.php:80
* @route '/risk-appetite/{appetite}'
*/
export const update = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/risk-appetite/{appetite}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\RiskAppetiteController::update
* @see app/Http/Controllers/RiskAppetiteController.php:80
* @route '/risk-appetite/{appetite}'
*/
update.url = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { appetite: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { appetite: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            appetite: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        appetite: typeof args.appetite === 'object'
        ? args.appetite.id
        : args.appetite,
    }

    return update.definition.url
            .replace('{appetite}', parsedArgs.appetite.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskAppetiteController::update
* @see app/Http/Controllers/RiskAppetiteController.php:80
* @route '/risk-appetite/{appetite}'
*/
update.put = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::update
* @see app/Http/Controllers/RiskAppetiteController.php:80
* @route '/risk-appetite/{appetite}'
*/
const updateForm = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::update
* @see app/Http/Controllers/RiskAppetiteController.php:80
* @route '/risk-appetite/{appetite}'
*/
updateForm.put = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RiskAppetiteController::destroy
* @see app/Http/Controllers/RiskAppetiteController.php:157
* @route '/risk-appetite/{appetite}'
*/
export const destroy = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/risk-appetite/{appetite}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RiskAppetiteController::destroy
* @see app/Http/Controllers/RiskAppetiteController.php:157
* @route '/risk-appetite/{appetite}'
*/
destroy.url = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { appetite: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { appetite: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            appetite: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        appetite: typeof args.appetite === 'object'
        ? args.appetite.id
        : args.appetite,
    }

    return destroy.definition.url
            .replace('{appetite}', parsedArgs.appetite.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskAppetiteController::destroy
* @see app/Http/Controllers/RiskAppetiteController.php:157
* @route '/risk-appetite/{appetite}'
*/
destroy.delete = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::destroy
* @see app/Http/Controllers/RiskAppetiteController.php:157
* @route '/risk-appetite/{appetite}'
*/
const destroyForm = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::destroy
* @see app/Http/Controllers/RiskAppetiteController.php:157
* @route '/risk-appetite/{appetite}'
*/
destroyForm.delete = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RiskAppetiteController::activate
* @see app/Http/Controllers/RiskAppetiteController.php:97
* @route '/risk-appetite/{appetite}/activate'
*/
export const activate = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

activate.definition = {
    methods: ["post"],
    url: '/risk-appetite/{appetite}/activate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskAppetiteController::activate
* @see app/Http/Controllers/RiskAppetiteController.php:97
* @route '/risk-appetite/{appetite}/activate'
*/
activate.url = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { appetite: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { appetite: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            appetite: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        appetite: typeof args.appetite === 'object'
        ? args.appetite.id
        : args.appetite,
    }

    return activate.definition.url
            .replace('{appetite}', parsedArgs.appetite.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskAppetiteController::activate
* @see app/Http/Controllers/RiskAppetiteController.php:97
* @route '/risk-appetite/{appetite}/activate'
*/
activate.post = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::activate
* @see app/Http/Controllers/RiskAppetiteController.php:97
* @route '/risk-appetite/{appetite}/activate'
*/
const activateForm = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskAppetiteController::activate
* @see app/Http/Controllers/RiskAppetiteController.php:97
* @route '/risk-appetite/{appetite}/activate'
*/
activateForm.post = (args: { appetite: number | { id: number } } | [appetite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

activate.form = activateForm

const RiskAppetiteController = { index, store, update, destroy, activate }

export default RiskAppetiteController