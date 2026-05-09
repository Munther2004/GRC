import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
export const show = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/invite/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
show.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return show.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
show.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
show.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
const showForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
showForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InviteAcceptController::show
* @see app/Http/Controllers/InviteAcceptController.php:16
* @route '/invite/{token}'
*/
showForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\InviteAcceptController::register
* @see app/Http/Controllers/InviteAcceptController.php:38
* @route '/invite/{token}/register'
*/
export const register = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(args, options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/invite/{token}/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InviteAcceptController::register
* @see app/Http/Controllers/InviteAcceptController.php:38
* @route '/invite/{token}/register'
*/
register.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return register.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InviteAcceptController::register
* @see app/Http/Controllers/InviteAcceptController.php:38
* @route '/invite/{token}/register'
*/
register.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InviteAcceptController::register
* @see app/Http/Controllers/InviteAcceptController.php:38
* @route '/invite/{token}/register'
*/
const registerForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InviteAcceptController::register
* @see app/Http/Controllers/InviteAcceptController.php:38
* @route '/invite/{token}/register'
*/
registerForm.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(args, options),
    method: 'post',
})

register.form = registerForm

const invite = {
    show: Object.assign(show, show),
    register: Object.assign(register, register),
}

export default invite