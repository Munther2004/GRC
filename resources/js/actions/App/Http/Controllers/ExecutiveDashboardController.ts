import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/executive-dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::index
* @see app/Http/Controllers/ExecutiveDashboardController.php:17
* @route '/executive-dashboard'
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
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/executive-dashboard/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::exportMethod
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const ExecutiveDashboardController = { index, exportMethod, export: exportMethod }

export default ExecutiveDashboardController