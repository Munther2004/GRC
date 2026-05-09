import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
export const pdf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(options),
    method: 'get',
})

pdf.definition = {
    methods: ["get","head"],
    url: '/executive-dashboard/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
pdf.url = (options?: RouteQueryOptions) => {
    return pdf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
pdf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
pdf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pdf.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
const pdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pdf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
pdfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pdf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExecutiveDashboardController::pdf
* @see app/Http/Controllers/ExecutiveDashboardController.php:22
* @route '/executive-dashboard/pdf'
*/
pdfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pdf.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

pdf.form = pdfForm

const executiveDashboard = {
    pdf: Object.assign(pdf, pdf),
}

export default executiveDashboard