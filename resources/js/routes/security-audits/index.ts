import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/security-audits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SecurityAuditController::index
 * @see app/Http/Controllers/SecurityAuditController.php:27
 * @route '/security-audits'
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
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
export const show = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/security-audits/{securityAudit}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
show.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { securityAudit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { securityAudit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    securityAudit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        securityAudit: typeof args.securityAudit === 'object'
                ? args.securityAudit.id
                : args.securityAudit,
                }

    return show.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
show.get = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
show.head = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
    const showForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
        showForm.get = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SecurityAuditController::show
 * @see app/Http/Controllers/SecurityAuditController.php:127
 * @route '/security-audits/{securityAudit}'
 */
        showForm.head = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
export const exportPdf = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
})

exportPdf.definition = {
    methods: ["get","head"],
    url: '/security-audits/{securityAudit}/export-pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
exportPdf.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { securityAudit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { securityAudit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    securityAudit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        securityAudit: typeof args.securityAudit === 'object'
                ? args.securityAudit.id
                : args.securityAudit,
                }

    return exportPdf.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
exportPdf.get = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
exportPdf.head = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
    const exportPdfForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
        exportPdfForm.get = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SecurityAuditController::exportPdf
 * @see app/Http/Controllers/SecurityAuditController.php:300
 * @route '/security-audits/{securityAudit}/export-pdf'
 */
        exportPdfForm.head = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportPdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportPdf.form = exportPdfForm
/**
* @see \App\Http\Controllers\SecurityAuditController::upload
 * @see app/Http/Controllers/SecurityAuditController.php:83
 * @route '/security-audits'
 */
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/security-audits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::upload
 * @see app/Http/Controllers/SecurityAuditController.php:83
 * @route '/security-audits'
 */
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::upload
 * @see app/Http/Controllers/SecurityAuditController.php:83
 * @route '/security-audits'
 */
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::upload
 * @see app/Http/Controllers/SecurityAuditController.php:83
 * @route '/security-audits'
 */
    const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: upload.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::upload
 * @see app/Http/Controllers/SecurityAuditController.php:83
 * @route '/security-audits'
 */
        uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: upload.url(options),
            method: 'post',
        })
    
    upload.form = uploadForm
/**
* @see \App\Http\Controllers\SecurityAuditController::generateRisks
 * @see app/Http/Controllers/SecurityAuditController.php:187
 * @route '/security-audits/{securityAudit}/generate-risks'
 */
export const generateRisks = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateRisks.url(args, options),
    method: 'post',
})

generateRisks.definition = {
    methods: ["post"],
    url: '/security-audits/{securityAudit}/generate-risks',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::generateRisks
 * @see app/Http/Controllers/SecurityAuditController.php:187
 * @route '/security-audits/{securityAudit}/generate-risks'
 */
generateRisks.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { securityAudit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { securityAudit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    securityAudit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        securityAudit: typeof args.securityAudit === 'object'
                ? args.securityAudit.id
                : args.securityAudit,
                }

    return generateRisks.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::generateRisks
 * @see app/Http/Controllers/SecurityAuditController.php:187
 * @route '/security-audits/{securityAudit}/generate-risks'
 */
generateRisks.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateRisks.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::generateRisks
 * @see app/Http/Controllers/SecurityAuditController.php:187
 * @route '/security-audits/{securityAudit}/generate-risks'
 */
    const generateRisksForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: generateRisks.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::generateRisks
 * @see app/Http/Controllers/SecurityAuditController.php:187
 * @route '/security-audits/{securityAudit}/generate-risks'
 */
        generateRisksForm.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: generateRisks.url(args, options),
            method: 'post',
        })
    
    generateRisks.form = generateRisksForm
/**
* @see \App\Http\Controllers\SecurityAuditController::saveAsEvidence
 * @see app/Http/Controllers/SecurityAuditController.php:257
 * @route '/security-audits/{securityAudit}/save-as-evidence'
 */
export const saveAsEvidence = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAsEvidence.url(args, options),
    method: 'post',
})

saveAsEvidence.definition = {
    methods: ["post"],
    url: '/security-audits/{securityAudit}/save-as-evidence',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::saveAsEvidence
 * @see app/Http/Controllers/SecurityAuditController.php:257
 * @route '/security-audits/{securityAudit}/save-as-evidence'
 */
saveAsEvidence.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { securityAudit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { securityAudit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    securityAudit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        securityAudit: typeof args.securityAudit === 'object'
                ? args.securityAudit.id
                : args.securityAudit,
                }

    return saveAsEvidence.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::saveAsEvidence
 * @see app/Http/Controllers/SecurityAuditController.php:257
 * @route '/security-audits/{securityAudit}/save-as-evidence'
 */
saveAsEvidence.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAsEvidence.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::saveAsEvidence
 * @see app/Http/Controllers/SecurityAuditController.php:257
 * @route '/security-audits/{securityAudit}/save-as-evidence'
 */
    const saveAsEvidenceForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: saveAsEvidence.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::saveAsEvidence
 * @see app/Http/Controllers/SecurityAuditController.php:257
 * @route '/security-audits/{securityAudit}/save-as-evidence'
 */
        saveAsEvidenceForm.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: saveAsEvidence.url(args, options),
            method: 'post',
        })
    
    saveAsEvidence.form = saveAsEvidenceForm
/**
* @see \App\Http\Controllers\SecurityAuditController::destroy
 * @see app/Http/Controllers/SecurityAuditController.php:320
 * @route '/security-audits/{securityAudit}'
 */
export const destroy = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/security-audits/{securityAudit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SecurityAuditController::destroy
 * @see app/Http/Controllers/SecurityAuditController.php:320
 * @route '/security-audits/{securityAudit}'
 */
destroy.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { securityAudit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { securityAudit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    securityAudit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        securityAudit: typeof args.securityAudit === 'object'
                ? args.securityAudit.id
                : args.securityAudit,
                }

    return destroy.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityAuditController::destroy
 * @see app/Http/Controllers/SecurityAuditController.php:320
 * @route '/security-audits/{securityAudit}'
 */
destroy.delete = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\SecurityAuditController::destroy
 * @see app/Http/Controllers/SecurityAuditController.php:320
 * @route '/security-audits/{securityAudit}'
 */
    const destroyForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SecurityAuditController::destroy
 * @see app/Http/Controllers/SecurityAuditController.php:320
 * @route '/security-audits/{securityAudit}'
 */
        destroyForm.delete = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const securityAudits = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
exportPdf: Object.assign(exportPdf, exportPdf),
upload: Object.assign(upload, upload),
generateRisks: Object.assign(generateRisks, generateRisks),
saveAsEvidence: Object.assign(saveAsEvidence, saveAsEvidence),
destroy: Object.assign(destroy, destroy),
}

export default securityAudits