import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
export const report = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: report.url(options),
    method: 'get',
})

report.definition = {
    methods: ["get","head"],
    url: '/gap-analysis/report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
report.url = (options?: RouteQueryOptions) => {
    return report.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
report.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: report.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
report.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: report.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
const reportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: report.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
reportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: report.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GapAnalysisController::report
* @see app/Http/Controllers/GapAnalysisController.php:85
* @route '/gap-analysis/report'
*/
reportForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: report.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

report.form = reportForm

const gapAnalysis = {
    index: Object.assign(index, index),
    report: Object.assign(report, report),
}

export default gapAnalysis