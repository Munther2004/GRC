import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ControlStatusRequestController::store
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
export const store = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/controls/{control}/request-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::store
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
store.url = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{control}', parsedArgs.control.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::store
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
store.post = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::store
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
    const storeForm = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::store
 * @see app/Http/Controllers/ControlStatusRequestController.php:81
 * @route '/controls/{control}/request-status'
 */
        storeForm.post = (args: { control: number | { id: number } } | [control: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/controls/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ControlStatusRequestController::index
 * @see app/Http/Controllers/ControlStatusRequestController.php:20
 * @route '/controls/approvals'
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
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:204
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
export const approve = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/controls/status-requests/{statusRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:204
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
approve.url = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { statusRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { statusRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    statusRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        statusRequest: typeof args.statusRequest === 'object'
                ? args.statusRequest.id
                : args.statusRequest,
                }

    return approve.definition.url
            .replace('{statusRequest}', parsedArgs.statusRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:204
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
approve.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:204
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
    const approveForm = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:204
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
        approveForm.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:255
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
export const reject = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/controls/status-requests/{statusRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:255
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
reject.url = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { statusRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { statusRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    statusRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        statusRequest: typeof args.statusRequest === 'object'
                ? args.statusRequest.id
                : args.statusRequest,
                }

    return reject.definition.url
            .replace('{statusRequest}', parsedArgs.statusRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:255
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
reject.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:255
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
    const rejectForm = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:255
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
        rejectForm.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:309
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
export const reviewEvidence = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reviewEvidence.url(args, options),
    method: 'post',
})

reviewEvidence.definition = {
    methods: ["post"],
    url: '/controls/status-requests/{statusRequest}/review-evidence',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:309
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
reviewEvidence.url = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { statusRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { statusRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    statusRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        statusRequest: typeof args.statusRequest === 'object'
                ? args.statusRequest.id
                : args.statusRequest,
                }

    return reviewEvidence.definition.url
            .replace('{statusRequest}', parsedArgs.statusRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:309
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
reviewEvidence.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reviewEvidence.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:309
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
    const reviewEvidenceForm = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reviewEvidence.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:309
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
        reviewEvidenceForm.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reviewEvidence.url(args, options),
            method: 'post',
        })
    
    reviewEvidence.form = reviewEvidenceForm
const ControlStatusRequestController = { store, index, approve, reject, reviewEvidence }

export default ControlStatusRequestController