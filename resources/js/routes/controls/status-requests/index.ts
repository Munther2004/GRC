import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:196
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
 * @see app/Http/Controllers/ControlStatusRequestController.php:196
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
 * @see app/Http/Controllers/ControlStatusRequestController.php:196
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
approve.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:196
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
    const approveForm = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::approve
 * @see app/Http/Controllers/ControlStatusRequestController.php:196
 * @route '/controls/status-requests/{statusRequest}/approve'
 */
        approveForm.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:247
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
 * @see app/Http/Controllers/ControlStatusRequestController.php:247
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
 * @see app/Http/Controllers/ControlStatusRequestController.php:247
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
reject.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:247
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
    const rejectForm = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::reject
 * @see app/Http/Controllers/ControlStatusRequestController.php:247
 * @route '/controls/status-requests/{statusRequest}/reject'
 */
        rejectForm.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:301
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
 * @see app/Http/Controllers/ControlStatusRequestController.php:301
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
 * @see app/Http/Controllers/ControlStatusRequestController.php:301
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
reviewEvidence.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reviewEvidence.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:301
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
    const reviewEvidenceForm = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reviewEvidence.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ControlStatusRequestController::reviewEvidence
 * @see app/Http/Controllers/ControlStatusRequestController.php:301
 * @route '/controls/status-requests/{statusRequest}/review-evidence'
 */
        reviewEvidenceForm.post = (args: { statusRequest: number | { id: number } } | [statusRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reviewEvidence.url(args, options),
            method: 'post',
        })
    
    reviewEvidence.form = reviewEvidenceForm
const statusRequests = {
    approve: Object.assign(approve, approve),
reject: Object.assign(reject, reject),
reviewEvidence: Object.assign(reviewEvidence, reviewEvidence),
}

export default statusRequests