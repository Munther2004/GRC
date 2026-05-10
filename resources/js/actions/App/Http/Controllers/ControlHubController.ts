import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/controls/hub',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ControlHubController::index
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
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
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
export const history = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/controls/{control}/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
history.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return history.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
history.get = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
history.head = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
    const historyForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
        historyForm.get = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
        historyForm.head = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
const ControlHubController = { index, history }

export default ControlHubController