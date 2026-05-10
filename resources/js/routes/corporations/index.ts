import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/corporation/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
    const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: register.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
        registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationRegistrationController::register
 * @see app/Http/Controllers/CorporationRegistrationController.php:26
 * @route '/corporation/register'
 */
        registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    register.form = registerForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::store
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/corporation/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::store
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::store
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::store
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::store
 * @see app/Http/Controllers/CorporationRegistrationController.php:42
 * @route '/corporation/register'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
export const registrationPending = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: registrationPending.url(args, options),
    method: 'get',
})

registrationPending.definition = {
    methods: ["get","head"],
    url: '/corporation/{corporation}/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
registrationPending.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return registrationPending.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
registrationPending.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: registrationPending.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
registrationPending.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: registrationPending.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
    const registrationPendingForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: registrationPending.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
        registrationPendingForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: registrationPending.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationRegistrationController::registrationPending
 * @see app/Http/Controllers/CorporationRegistrationController.php:85
 * @route '/corporation/{corporation}/pending'
 */
        registrationPendingForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: registrationPending.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    registrationPending.form = registrationPendingForm
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
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
export const managerSignup = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: managerSignup.url(args, options),
    method: 'get',
})

managerSignup.definition = {
    methods: ["get","head"],
    url: '/corporation/{corporation}/manager-signup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
managerSignup.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return managerSignup.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
managerSignup.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: managerSignup.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
managerSignup.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: managerSignup.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
    const managerSignupForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: managerSignup.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
        managerSignupForm.get = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: managerSignup.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationRegistrationController::managerSignup
 * @see app/Http/Controllers/CorporationRegistrationController.php:138
 * @route '/corporation/{corporation}/manager-signup'
 */
        managerSignupForm.head = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: managerSignup.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    managerSignup.form = managerSignupForm
/**
* @see \App\Http\Controllers\CorporationRegistrationController::managerRegister
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
export const managerRegister = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: managerRegister.url(args, options),
    method: 'post',
})

managerRegister.definition = {
    methods: ["post"],
    url: '/corporation/{corporation}/manager-signup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationRegistrationController::managerRegister
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
managerRegister.url = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return managerRegister.definition.url
            .replace('{corporation}', parsedArgs.corporation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationRegistrationController::managerRegister
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
managerRegister.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: managerRegister.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationRegistrationController::managerRegister
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
    const managerRegisterForm = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: managerRegister.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationRegistrationController::managerRegister
 * @see app/Http/Controllers/CorporationRegistrationController.php:164
 * @route '/corporation/{corporation}/manager-signup'
 */
        managerRegisterForm.post = (args: { corporation: number | { id: number } } | [corporation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: managerRegister.url(args, options),
            method: 'post',
        })
    
    managerRegister.form = managerRegisterForm
const corporations = {
    register: Object.assign(register, register),
store: Object.assign(store, store),
registrationPending: Object.assign(registrationPending, registrationPending),
verifyCode: Object.assign(verifyCode, verifyCode),
managerSignup: Object.assign(managerSignup, managerSignup),
managerRegister: Object.assign(managerRegister, managerRegister),
}

export default corporations