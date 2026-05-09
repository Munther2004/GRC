import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generate.url(options),
    method: 'get',
})

generate.definition = {
    methods: ["get","head"],
    url: '/reports/executive-summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
generate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
generate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
generateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::generate
* @see app/Http/Controllers/ExecutiveSummaryController.php:16
* @route '/reports/executive-summary'
*/
generateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

generate.form = generateForm

const ExecutiveSummaryController = { generate }

export default ExecutiveSummaryController