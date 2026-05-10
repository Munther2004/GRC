import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/corporate/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporateDashboardController::dashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:12
 * @route '/corporate/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
export const showDashboard = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showDashboard.url(args, options),
    method: 'get',
})

showDashboard.definition = {
    methods: ["get","head"],
    url: '/corporate/{corporation}/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
showDashboard.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return showDashboard.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
showDashboard.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showDashboard.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
showDashboard.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showDashboard.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
    const showDashboardForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showDashboard.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
        showDashboardForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showDashboard.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporateDashboardController::showDashboard
 * @see app/Http/Controllers/CorporateDashboardController.php:39
 * @route '/corporate/{corporation}/dashboard'
 */
        showDashboardForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showDashboard.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showDashboard.form = showDashboardForm
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
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
export const team = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: team.url(options),
    method: 'get',
})

team.definition = {
    methods: ["get","head"],
    url: '/corporate/team',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
team.url = (options?: RouteQueryOptions) => {
    return team.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
team.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: team.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
team.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: team.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
    const teamForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: team.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
        teamForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: team.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporateDashboardController::team
 * @see app/Http/Controllers/CorporateDashboardController.php:77
 * @route '/corporate/team'
 */
        teamForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: team.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    team.form = teamForm
const corporate = {
    dashboard: Object.assign(dashboard, dashboard),
showDashboard: Object.assign(showDashboard, showDashboard),
companyDetails: Object.assign(companyDetails, companyDetails),
team: Object.assign(team, team),
}

export default corporate