import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
export const result = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: result.url(options),
    method: 'get',
})

result.definition = {
    methods: ["get","head"],
    url: '/assessments/compare/result',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
result.url = (options?: RouteQueryOptions) => {
    return result.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
result.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: result.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
result.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: result.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
    const resultForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: result.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
        resultForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: result.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentComparisonController::result
 * @see app/Http/Controllers/AssessmentComparisonController.php:41
 * @route '/assessments/compare/result'
 */
        resultForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: result.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    result.form = resultForm
/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/assessments/compare/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentComparisonController::exportMethod
 * @see app/Http/Controllers/AssessmentComparisonController.php:67
 * @route '/assessments/compare/export'
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
const compare = {
    result: Object.assign(result, result),
export: Object.assign(exportMethod, exportMethod),
}

export default compare