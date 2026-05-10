import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/evidence-coverage',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EvidenceCoverageController::index
 * @see app/Http/Controllers/EvidenceCoverageController.php:43
 * @route '/evidence-coverage'
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
const evidenceCoverage = {
    index: Object.assign(index, index),
}

export default evidenceCoverage