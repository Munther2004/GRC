import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/gap-analysis',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::index
* @see app/Http/Controllers/GapAnalysisController.php:19
* @route '/gap-analysis'
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
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
export const generateReport = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateReport.url(options),
    method: 'get',
})

generateReport.definition = {
    methods: ["get","head"],
    url: '/gap-analysis/report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
generateReport.url = (options?: RouteQueryOptions) => {
    return generateReport.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
generateReport.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateReport.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
generateReport.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateReport.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
const generateReportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generateReport.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
generateReportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generateReport.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::generateReport
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
generateReportForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: generateReport.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

generateReport.form = generateReportForm

const GapAnalysisController = { index, generateReport }

export default GapAnalysisController