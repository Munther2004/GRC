import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/assessments/compare',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::index
* @see app/Http/Controllers/AssessmentComparisonController.php:17
* @route '/assessments/compare'
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
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
export const compare = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: compare.url(options),
    method: 'get',
})

compare.definition = {
    methods: ["get","head"],
    url: '/assessments/compare/result',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
compare.url = (options?: RouteQueryOptions) => {
    return compare.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
compare.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: compare.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
compare.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: compare.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
const compareForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: compare.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
compareForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: compare.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::compare
* @see app/Http/Controllers/AssessmentComparisonController.php:38
* @route '/assessments/compare/result'
*/
compareForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: compare.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

compare.form = compareForm

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
export const exportPdf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(options),
    method: 'get',
})

exportPdf.definition = {
    methods: ["get","head"],
    url: '/assessments/compare/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
exportPdf.url = (options?: RouteQueryOptions) => {
    return exportPdf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
exportPdf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
exportPdf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportPdf.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
const exportPdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
exportPdfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportPdf
* @see app/Http/Controllers/AssessmentComparisonController.php:64
* @route '/assessments/compare/export'
*/
exportPdfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportPdf.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportPdf.form = exportPdfForm

const AssessmentComparisonController = { index, compare, exportPdf }

export default AssessmentComparisonController