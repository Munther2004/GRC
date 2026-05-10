import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/crosswalk',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CrosswalkController::index
 * @see app/Http/Controllers/CrosswalkController.php:14
 * @route '/crosswalk'
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
const CrosswalkController = { index }

export default CrosswalkController