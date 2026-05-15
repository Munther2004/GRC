import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/assessments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentController::index
 * @see app/Http/Controllers/AssessmentController.php:27
 * @route '/assessments'
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
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/assessments/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentController::create
 * @see app/Http/Controllers/AssessmentController.php:61
 * @route '/assessments/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
export const exportPdf = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
})

exportPdf.definition = {
    methods: ["get","head"],
    url: '/assessments/{assessment}/export-pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
exportPdf.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return exportPdf.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
exportPdf.get = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
exportPdf.head = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
    const exportPdfForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
        exportPdfForm.get = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentController::exportPdf
 * @see app/Http/Controllers/AssessmentController.php:423
 * @route '/assessments/{assessment}/export-pdf'
 */
        exportPdfForm.head = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\AssessmentController::store
 * @see app/Http/Controllers/AssessmentController.php:68
 * @route '/assessments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/assessments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssessmentController::store
 * @see app/Http/Controllers/AssessmentController.php:68
 * @route '/assessments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::store
 * @see app/Http/Controllers/AssessmentController.php:68
 * @route '/assessments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssessmentController::store
 * @see app/Http/Controllers/AssessmentController.php:68
 * @route '/assessments'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::store
 * @see app/Http/Controllers/AssessmentController.php:68
 * @route '/assessments'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\AssessmentController::destroy
 * @see app/Http/Controllers/AssessmentController.php:587
 * @route '/assessments/{assessment}'
 */
export const destroy = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/assessments/{assessment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AssessmentController::destroy
 * @see app/Http/Controllers/AssessmentController.php:587
 * @route '/assessments/{assessment}'
 */
destroy.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return destroy.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::destroy
 * @see app/Http/Controllers/AssessmentController.php:587
 * @route '/assessments/{assessment}'
 */
destroy.delete = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AssessmentController::destroy
 * @see app/Http/Controllers/AssessmentController.php:587
 * @route '/assessments/{assessment}'
 */
    const destroyForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::destroy
 * @see app/Http/Controllers/AssessmentController.php:587
 * @route '/assessments/{assessment}'
 */
        destroyForm.delete = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
export const questionnaire = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: questionnaire.url(args, options),
    method: 'get',
})

questionnaire.definition = {
    methods: ["get","head"],
    url: '/assessments/{assessment}/questionnaire',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
questionnaire.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return questionnaire.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
questionnaire.get = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: questionnaire.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
questionnaire.head = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: questionnaire.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
    const questionnaireForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: questionnaire.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
        questionnaireForm.get = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: questionnaire.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentController::questionnaire
 * @see app/Http/Controllers/AssessmentController.php:169
 * @route '/assessments/{assessment}/questionnaire'
 */
        questionnaireForm.head = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: questionnaire.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    questionnaire.form = questionnaireForm
/**
* @see \App\Http\Controllers\AssessmentController::saveAnswers
 * @see app/Http/Controllers/AssessmentController.php:241
 * @route '/assessments/{assessment}/save-answers'
 */
export const saveAnswers = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAnswers.url(args, options),
    method: 'post',
})

saveAnswers.definition = {
    methods: ["post"],
    url: '/assessments/{assessment}/save-answers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssessmentController::saveAnswers
 * @see app/Http/Controllers/AssessmentController.php:241
 * @route '/assessments/{assessment}/save-answers'
 */
saveAnswers.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return saveAnswers.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::saveAnswers
 * @see app/Http/Controllers/AssessmentController.php:241
 * @route '/assessments/{assessment}/save-answers'
 */
saveAnswers.post = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAnswers.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssessmentController::saveAnswers
 * @see app/Http/Controllers/AssessmentController.php:241
 * @route '/assessments/{assessment}/save-answers'
 */
    const saveAnswersForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: saveAnswers.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::saveAnswers
 * @see app/Http/Controllers/AssessmentController.php:241
 * @route '/assessments/{assessment}/save-answers'
 */
        saveAnswersForm.post = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: saveAnswers.url(args, options),
            method: 'post',
        })
    
    saveAnswers.form = saveAnswersForm
/**
* @see \App\Http\Controllers\AssessmentController::submit
 * @see app/Http/Controllers/AssessmentController.php:341
 * @route '/assessments/{assessment}/submit'
 */
export const submit = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/assessments/{assessment}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssessmentController::submit
 * @see app/Http/Controllers/AssessmentController.php:341
 * @route '/assessments/{assessment}/submit'
 */
submit.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return submit.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::submit
 * @see app/Http/Controllers/AssessmentController.php:341
 * @route '/assessments/{assessment}/submit'
 */
submit.post = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssessmentController::submit
 * @see app/Http/Controllers/AssessmentController.php:341
 * @route '/assessments/{assessment}/submit'
 */
    const submitForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::submit
 * @see app/Http/Controllers/AssessmentController.php:341
 * @route '/assessments/{assessment}/submit'
 */
        submitForm.post = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \App\Http\Controllers\AssessmentController::autoFill
 * @see app/Http/Controllers/AssessmentController.php:271
 * @route '/assessments/{assessment}/auto-fill'
 */
export const autoFill = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: autoFill.url(args, options),
    method: 'post',
})

autoFill.definition = {
    methods: ["post"],
    url: '/assessments/{assessment}/auto-fill',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssessmentController::autoFill
 * @see app/Http/Controllers/AssessmentController.php:271
 * @route '/assessments/{assessment}/auto-fill'
 */
autoFill.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return autoFill.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::autoFill
 * @see app/Http/Controllers/AssessmentController.php:271
 * @route '/assessments/{assessment}/auto-fill'
 */
autoFill.post = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: autoFill.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssessmentController::autoFill
 * @see app/Http/Controllers/AssessmentController.php:271
 * @route '/assessments/{assessment}/auto-fill'
 */
    const autoFillForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: autoFill.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::autoFill
 * @see app/Http/Controllers/AssessmentController.php:271
 * @route '/assessments/{assessment}/auto-fill'
 */
        autoFillForm.post = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: autoFill.url(args, options),
            method: 'post',
        })
    
    autoFill.form = autoFillForm
/**
* @see \App\Http\Controllers\AssessmentController::uploadEvidence
 * @see app/Http/Controllers/AssessmentController.php:378
 * @route '/assessments/{assessment}/items/{item}/evidence'
 */
export const uploadEvidence = (args: { assessment: number | { id: number }, item: number | { id: number } } | [assessment: number | { id: number }, item: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadEvidence.url(args, options),
    method: 'post',
})

uploadEvidence.definition = {
    methods: ["post"],
    url: '/assessments/{assessment}/items/{item}/evidence',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssessmentController::uploadEvidence
 * @see app/Http/Controllers/AssessmentController.php:378
 * @route '/assessments/{assessment}/items/{item}/evidence'
 */
uploadEvidence.url = (args: { assessment: number | { id: number }, item: number | { id: number } } | [assessment: number | { id: number }, item: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                    item: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                                item: typeof args.item === 'object'
                ? args.item.id
                : args.item,
                }

    return uploadEvidence.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::uploadEvidence
 * @see app/Http/Controllers/AssessmentController.php:378
 * @route '/assessments/{assessment}/items/{item}/evidence'
 */
uploadEvidence.post = (args: { assessment: number | { id: number }, item: number | { id: number } } | [assessment: number | { id: number }, item: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadEvidence.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssessmentController::uploadEvidence
 * @see app/Http/Controllers/AssessmentController.php:378
 * @route '/assessments/{assessment}/items/{item}/evidence'
 */
    const uploadEvidenceForm = (args: { assessment: number | { id: number }, item: number | { id: number } } | [assessment: number | { id: number }, item: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadEvidence.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::uploadEvidence
 * @see app/Http/Controllers/AssessmentController.php:378
 * @route '/assessments/{assessment}/items/{item}/evidence'
 */
        uploadEvidenceForm.post = (args: { assessment: number | { id: number }, item: number | { id: number } } | [assessment: number | { id: number }, item: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadEvidence.url(args, options),
            method: 'post',
        })
    
    uploadEvidence.form = uploadEvidenceForm
/**
* @see \App\Http\Controllers\AssessmentController::explainControl
 * @see app/Http/Controllers/AssessmentController.php:562
 * @route '/assessments/explain-control'
 */
export const explainControl = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: explainControl.url(options),
    method: 'post',
})

explainControl.definition = {
    methods: ["post"],
    url: '/assessments/explain-control',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AssessmentController::explainControl
 * @see app/Http/Controllers/AssessmentController.php:562
 * @route '/assessments/explain-control'
 */
explainControl.url = (options?: RouteQueryOptions) => {
    return explainControl.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::explainControl
 * @see app/Http/Controllers/AssessmentController.php:562
 * @route '/assessments/explain-control'
 */
explainControl.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: explainControl.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AssessmentController::explainControl
 * @see app/Http/Controllers/AssessmentController.php:562
 * @route '/assessments/explain-control'
 */
    const explainControlForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: explainControl.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::explainControl
 * @see app/Http/Controllers/AssessmentController.php:562
 * @route '/assessments/explain-control'
 */
        explainControlForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: explainControl.url(options),
            method: 'post',
        })
    
    explainControl.form = explainControlForm
/**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
export const show = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/assessments/{assessment}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
show.url = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assessment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assessment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assessment: typeof args.assessment === 'object'
                ? args.assessment.id
                : args.assessment,
                }

    return show.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
show.get = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
show.head = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
    const showForm = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
        showForm.get = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AssessmentController::show
 * @see app/Http/Controllers/AssessmentController.php:130
 * @route '/assessments/{assessment}'
 */
        showForm.head = (args: { assessment: number | { id: number } } | [assessment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const AssessmentController = { index, create, exportPdf, store, destroy, questionnaire, saveAnswers, submit, autoFill, uploadEvidence, explainControl, show }

export default AssessmentController