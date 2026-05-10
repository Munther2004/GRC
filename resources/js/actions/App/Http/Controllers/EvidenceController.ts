import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/evidence',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EvidenceController::index
 * @see app/Http/Controllers/EvidenceController.php:22
 * @route '/evidence'
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
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
export const download = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/evidence/{evidence}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
download.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evidence: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evidence: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evidence: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evidence: typeof args.evidence === 'object'
                ? args.evidence.id
                : args.evidence,
                }

    return download.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
download.get = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
download.head = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
    const downloadForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: download.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
        downloadForm.get = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EvidenceController::download
 * @see app/Http/Controllers/EvidenceController.php:245
 * @route '/evidence/{evidence}/download'
 */
        downloadForm.head = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    download.form = downloadForm
/**
* @see \App\Http\Controllers\EvidenceController::approve
 * @see app/Http/Controllers/EvidenceController.php:118
 * @route '/evidence/{evidence}/approve'
 */
export const approve = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/evidence/{evidence}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EvidenceController::approve
 * @see app/Http/Controllers/EvidenceController.php:118
 * @route '/evidence/{evidence}/approve'
 */
approve.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evidence: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evidence: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evidence: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evidence: typeof args.evidence === 'object'
                ? args.evidence.id
                : args.evidence,
                }

    return approve.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceController::approve
 * @see app/Http/Controllers/EvidenceController.php:118
 * @route '/evidence/{evidence}/approve'
 */
approve.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EvidenceController::approve
 * @see app/Http/Controllers/EvidenceController.php:118
 * @route '/evidence/{evidence}/approve'
 */
    const approveForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EvidenceController::approve
 * @see app/Http/Controllers/EvidenceController.php:118
 * @route '/evidence/{evidence}/approve'
 */
        approveForm.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\EvidenceController::reject
 * @see app/Http/Controllers/EvidenceController.php:136
 * @route '/evidence/{evidence}/reject'
 */
export const reject = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/evidence/{evidence}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EvidenceController::reject
 * @see app/Http/Controllers/EvidenceController.php:136
 * @route '/evidence/{evidence}/reject'
 */
reject.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evidence: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evidence: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evidence: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evidence: typeof args.evidence === 'object'
                ? args.evidence.id
                : args.evidence,
                }

    return reject.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceController::reject
 * @see app/Http/Controllers/EvidenceController.php:136
 * @route '/evidence/{evidence}/reject'
 */
reject.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EvidenceController::reject
 * @see app/Http/Controllers/EvidenceController.php:136
 * @route '/evidence/{evidence}/reject'
 */
    const rejectForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EvidenceController::reject
 * @see app/Http/Controllers/EvidenceController.php:136
 * @route '/evidence/{evidence}/reject'
 */
        rejectForm.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\EvidenceController::aiReview
 * @see app/Http/Controllers/EvidenceController.php:271
 * @route '/evidence/{evidence}/ai-review'
 */
export const aiReview = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: aiReview.url(args, options),
    method: 'post',
})

aiReview.definition = {
    methods: ["post"],
    url: '/evidence/{evidence}/ai-review',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EvidenceController::aiReview
 * @see app/Http/Controllers/EvidenceController.php:271
 * @route '/evidence/{evidence}/ai-review'
 */
aiReview.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evidence: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evidence: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evidence: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evidence: typeof args.evidence === 'object'
                ? args.evidence.id
                : args.evidence,
                }

    return aiReview.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceController::aiReview
 * @see app/Http/Controllers/EvidenceController.php:271
 * @route '/evidence/{evidence}/ai-review'
 */
aiReview.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: aiReview.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EvidenceController::aiReview
 * @see app/Http/Controllers/EvidenceController.php:271
 * @route '/evidence/{evidence}/ai-review'
 */
    const aiReviewForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: aiReview.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EvidenceController::aiReview
 * @see app/Http/Controllers/EvidenceController.php:271
 * @route '/evidence/{evidence}/ai-review'
 */
        aiReviewForm.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: aiReview.url(args, options),
            method: 'post',
        })
    
    aiReview.form = aiReviewForm
/**
* @see \App\Http\Controllers\EvidenceController::destroy
 * @see app/Http/Controllers/EvidenceController.php:256
 * @route '/evidence/{evidence}'
 */
export const destroy = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/evidence/{evidence}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\EvidenceController::destroy
 * @see app/Http/Controllers/EvidenceController.php:256
 * @route '/evidence/{evidence}'
 */
destroy.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { evidence: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { evidence: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    evidence: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        evidence: typeof args.evidence === 'object'
                ? args.evidence.id
                : args.evidence,
                }

    return destroy.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EvidenceController::destroy
 * @see app/Http/Controllers/EvidenceController.php:256
 * @route '/evidence/{evidence}'
 */
destroy.delete = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\EvidenceController::destroy
 * @see app/Http/Controllers/EvidenceController.php:256
 * @route '/evidence/{evidence}'
 */
    const destroyForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EvidenceController::destroy
 * @see app/Http/Controllers/EvidenceController.php:256
 * @route '/evidence/{evidence}'
 */
        destroyForm.delete = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const EvidenceController = { index, download, approve, reject, aiReview, destroy }

export default EvidenceController