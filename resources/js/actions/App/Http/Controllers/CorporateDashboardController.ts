import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/corporate/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::index
* @see app/Http/Controllers/CorporateDashboardController.php:12
* @route '/corporate/dashboard'
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
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
export const show = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/corporate/{corporation}/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
show.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { corporation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { corporation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            corporation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        corporation: typeof args.corporation === 'object'
        ? args.corporation.id
        : args.corporation,
    }

    return show.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
show.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
show.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
const showForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
showForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::show
* @see app/Http/Controllers/CorporateDashboardController.php:39
* @route '/corporate/{corporation}/dashboard'
*/
showForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
export const companyDetails = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companyDetails.url(options),
    method: 'get',
})

companyDetails.definition = {
    methods: ["get","head"],
    url: '/corporate/company-details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
companyDetails.url = (options?: RouteQueryOptions) => {
    return companyDetails.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
companyDetails.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companyDetails.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
companyDetails.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: companyDetails.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
const companyDetailsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: companyDetails.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
companyDetailsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: companyDetails.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::companyDetails
* @see app/Http/Controllers/CorporateDashboardController.php:59
* @route '/corporate/company-details'
*/
companyDetailsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: companyDetails.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

companyDetails.form = companyDetailsForm

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
export const teamMembers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: teamMembers.url(options),
    method: 'get',
})

teamMembers.definition = {
    methods: ["get","head"],
    url: '/corporate/team',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
teamMembers.url = (options?: RouteQueryOptions) => {
    return teamMembers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
teamMembers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: teamMembers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
teamMembers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: teamMembers.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
const teamMembersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: teamMembers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
teamMembersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: teamMembers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CorporateDashboardController::teamMembers
* @see app/Http/Controllers/CorporateDashboardController.php:77
* @route '/corporate/team'
*/
teamMembersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: teamMembers.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

teamMembers.form = teamMembersForm

const CorporateDashboardController = { index, show, companyDetails, teamMembers }

export default CorporateDashboardController