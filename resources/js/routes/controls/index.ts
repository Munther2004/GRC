import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import statusRequests from './status-requests'
/**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
export const hub = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: hub.url(options),
    method: 'get',
})

hub.definition = {
    methods: ["get","head"],
    url: '/controls/hub',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
hub.url = (options?: RouteQueryOptions) => {
    return hub.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
hub.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: hub.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
hub.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: hub.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
    const hubForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: hub.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
        hubForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: hub.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ControlHubController::hub
 * @see app/Http/Controllers/ControlHubController.php:15
 * @route '/controls/hub'
 */
        hubForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: hub.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    hub.form = hubForm
/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
export const history = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/controls/{control}/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
history.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { control: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    control: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control: typeof args.control === 'object'
                ? args.control.id
                : args.control,
                }

    return history.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
history.get = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
history.head = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
    const historyForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
        historyForm.get = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ControlHubController::history
 * @see app/Http/Controllers/ControlHubController.php:95
 * @route '/controls/{control}/history'
 */
        historyForm.head = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::requestStatus
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
export const requestStatus = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestStatus.url(args, options),
    method: 'post',
})

requestStatus.definition = {
    methods: ["post"],
    url: '/controls/{control}/request-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::requestStatus
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
requestStatus.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { control: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { control: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    control: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        control: typeof args.control === 'object'
                ? args.control.id
                : args.control,
                }

    return requestStatus.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::requestStatus
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
requestStatus.post = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestStatus.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::requestStatus
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
    const requestStatusForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: requestStatus.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::requestStatus
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
        requestStatusForm.post = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: requestStatus.url(args, options),
            method: 'post',
        })
    
    requestStatus.form = requestStatusForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
export const approvals = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/controls/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
approvals.url = (options?: RouteQueryOptions) => {
    return approvals.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
approvals.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
approvals.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
    const approvalsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
        approvalsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ControlStatusRequestController::approvals
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
        approvalsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    approvals.form = approvalsForm
const controls = {
    hub: Object.assign(hub, hub),
history: Object.assign(history, history),
requestStatus: Object.assign(requestStatus, requestStatus),
approvals: Object.assign(approvals, approvals),
statusRequests: Object.assign(statusRequests, statusRequests),
}

export default controls