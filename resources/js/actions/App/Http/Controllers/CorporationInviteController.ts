import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/invites',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CorporationInviteController::index
 * @see app/Http/Controllers/CorporationInviteController.php:48
 * @route '/admin/invites'
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
* @see \App\Http\Controllers\CorporationInviteController::storeShareable
 * @see app/Http/Controllers/CorporationInviteController.php:101
 * @route '/admin/invites/shareable'
 */
export const storeShareable = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeShareable.url(options),
    method: 'post',
})

storeShareable.definition = {
    methods: ["post"],
    url: '/admin/invites/shareable',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationInviteController::storeShareable
 * @see app/Http/Controllers/CorporationInviteController.php:101
 * @route '/admin/invites/shareable'
 */
storeShareable.url = (options?: RouteQueryOptions) => {
    return storeShareable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationInviteController::storeShareable
 * @see app/Http/Controllers/CorporationInviteController.php:101
 * @route '/admin/invites/shareable'
 */
storeShareable.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeShareable.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationInviteController::storeShareable
 * @see app/Http/Controllers/CorporationInviteController.php:101
 * @route '/admin/invites/shareable'
 */
    const storeShareableForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeShareable.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationInviteController::storeShareable
 * @see app/Http/Controllers/CorporationInviteController.php:101
 * @route '/admin/invites/shareable'
 */
        storeShareableForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeShareable.url(options),
            method: 'post',
        })
    
    storeShareable.form = storeShareableForm
/**
* @see \App\Http\Controllers\CorporationInviteController::storeEmail
 * @see app/Http/Controllers/CorporationInviteController.php:139
 * @route '/admin/invites/email'
 */
export const storeEmail = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeEmail.url(options),
    method: 'post',
})

storeEmail.definition = {
    methods: ["post"],
    url: '/admin/invites/email',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationInviteController::storeEmail
 * @see app/Http/Controllers/CorporationInviteController.php:139
 * @route '/admin/invites/email'
 */
storeEmail.url = (options?: RouteQueryOptions) => {
    return storeEmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationInviteController::storeEmail
 * @see app/Http/Controllers/CorporationInviteController.php:139
 * @route '/admin/invites/email'
 */
storeEmail.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeEmail.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CorporationInviteController::storeEmail
 * @see app/Http/Controllers/CorporationInviteController.php:139
 * @route '/admin/invites/email'
 */
    const storeEmailForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeEmail.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationInviteController::storeEmail
 * @see app/Http/Controllers/CorporationInviteController.php:139
 * @route '/admin/invites/email'
 */
        storeEmailForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeEmail.url(options),
            method: 'post',
        })
    
    storeEmail.form = storeEmailForm
/**
* @see \App\Http\Controllers\CorporationInviteController::destroy
 * @see app/Http/Controllers/CorporationInviteController.php:179
 * @route '/admin/invites/{invite}'
 */
export const destroy = (args: { invite: number | { id: number } } | [invite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/invites/{invite}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CorporationInviteController::destroy
 * @see app/Http/Controllers/CorporationInviteController.php:179
 * @route '/admin/invites/{invite}'
 */
destroy.url = (args: { invite: number | { id: number } } | [invite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invite: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { invite: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    invite: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        invite: typeof args.invite === 'object'
                ? args.invite.id
                : args.invite,
                }

    return destroy.definition.url
            .replace('{invite}', parsedArgs.invite.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationInviteController::destroy
 * @see app/Http/Controllers/CorporationInviteController.php:179
 * @route '/admin/invites/{invite}'
 */
destroy.delete = (args: { invite: number | { id: number } } | [invite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CorporationInviteController::destroy
 * @see app/Http/Controllers/CorporationInviteController.php:179
 * @route '/admin/invites/{invite}'
 */
    const destroyForm = (args: { invite: number | { id: number } } | [invite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CorporationInviteController::destroy
 * @see app/Http/Controllers/CorporationInviteController.php:179
 * @route '/admin/invites/{invite}'
 */
        destroyForm.delete = (args: { invite: number | { id: number } } | [invite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const CorporationInviteController = { index, storeShareable, storeEmail, destroy }

export default CorporationInviteController