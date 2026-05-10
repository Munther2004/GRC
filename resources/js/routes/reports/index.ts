import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ReportController::index
 * @see app/Http/Controllers/ReportController.php:112
 * @route '/reports'
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
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
 */
export const exportPdf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(options),
    method: 'get',
})

exportPdf.definition = {
    methods: ["get","head"],
    url: '/reports/export-pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
 */
exportPdf.url = (options?: RouteQueryOptions) => {
    return exportPdf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
 */
exportPdf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
 */
exportPdf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportPdf.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
 */
    const exportPdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportPdf.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
 */
        exportPdfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportPdf.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ReportController::exportPdf
 * @see app/Http/Controllers/ReportController.php:136
 * @route '/reports/export-pdf'
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
/**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
export const executiveSummary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executiveSummary.url(options),
    method: 'get',
})

executiveSummary.definition = {
    methods: ["get","head"],
    url: '/reports/executive-summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
executiveSummary.url = (options?: RouteQueryOptions) => {
    return executiveSummary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
executiveSummary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executiveSummary.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
executiveSummary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executiveSummary.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
    const executiveSummaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: executiveSummary.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
        executiveSummaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: executiveSummary.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ExecutiveSummaryController::executiveSummary
 * @see app/Http/Controllers/ExecutiveSummaryController.php:16
 * @route '/reports/executive-summary'
 */
        executiveSummaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: executiveSummary.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    executiveSummary.form = executiveSummaryForm
const reports = {
    index: Object.assign(index, index),
exportPdf: Object.assign(exportPdf, exportPdf),
executiveSummary: Object.assign(executiveSummary, executiveSummary),
}

export default reports