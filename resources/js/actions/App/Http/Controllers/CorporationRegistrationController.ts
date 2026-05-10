import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
export const showRegistrationForm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showRegistrationForm.url(options),
    method: 'get',
})

showRegistrationForm.definition = {
    methods: ["get","head"],
    url: '/corporation/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
showRegistrationForm.url = (options?: RouteQueryOptions) => {
    return showRegistrationForm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
showRegistrationForm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showRegistrationForm.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
showRegistrationForm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showRegistrationForm.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
    const showRegistrationFormForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showRegistrationForm.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
        showRegistrationFormForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showRegistrationForm.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationRegistrationController::showRegistrationForm
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
        showRegistrationFormForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showRegistrationForm.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showRegistrationForm.form = showRegistrationFormForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/corporation/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
    const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: register.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
        registerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: register.url(options),
            method: 'post',
        })
    
    register.form = registerForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
export const pending = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(args, options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/corporation/{corporation}/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
pending.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return pending.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
pending.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
pending.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
    const pendingForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
        pendingForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationRegistrationController::pending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
        pendingForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pending.form = pendingForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::verifyCode
 * @see app/Http/Controllers/CorporationRegistrationController.php:102
 * @route '/corporation/{corporation}/verify-code'
 */
export const verifyCode = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyCode.url(args, options),
    method: 'post',
})

verifyCode.definition = {
    methods: ["post"],
    url: '/corporation/{corporation}/verify-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::verifyCode
 * @see app/Http/Controllers/CorporationRegistrationController.php:102
 * @route '/corporation/{corporation}/verify-code'
 */
verifyCode.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return verifyCode.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::verifyCode
 * @see app/Http/Controllers/CorporationRegistrationController.php:102
 * @route '/corporation/{corporation}/verify-code'
 */
verifyCode.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyCode.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::verifyCode
 * @see app/Http/Controllers/CorporationRegistrationController.php:102
 * @route '/corporation/{corporation}/verify-code'
 */
    const verifyCodeForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verifyCode.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::verifyCode
 * @see app/Http/Controllers/CorporationRegistrationController.php:102
 * @route '/corporation/{corporation}/verify-code'
 */
        verifyCodeForm.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verifyCode.url(args, options),
            method: 'post',
        })
    
    verifyCode.form = verifyCodeForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
export const showManagerSignup = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showManagerSignup.url(args, options),
    method: 'get',
})

showManagerSignup.definition = {
    methods: ["get","head"],
    url: '/corporation/{corporation}/manager-signup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
showManagerSignup.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return showManagerSignup.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
showManagerSignup.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showManagerSignup.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
showManagerSignup.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showManagerSignup.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
    const showManagerSignupForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showManagerSignup.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
        showManagerSignupForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showManagerSignup.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationRegistrationController::showManagerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
        showManagerSignupForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showManagerSignup.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showManagerSignup.form = showManagerSignupForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::registerManager
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
export const registerManager = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registerManager.url(args, options),
    method: 'post',
})

registerManager.definition = {
    methods: ["post"],
    url: '/corporation/{corporation}/manager-signup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::registerManager
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
registerManager.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return registerManager.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::registerManager
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
registerManager.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registerManager.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::registerManager
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
    const registerManagerForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registerManager.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::registerManager
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
        registerManagerForm.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registerManager.url(args, options),
            method: 'post',
        })
    
    registerManager.form = registerManagerForm
const CorporationRegistrationController = { showRegistrationForm, register, pending, verifyCode, showManagerSignup, registerManager }

export default CorporationRegistrationController