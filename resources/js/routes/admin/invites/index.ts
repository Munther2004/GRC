import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
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
* @see \App\Http\Controllers\CorporationInviteController::shareable
* @see app/Http/Controllers/CorporationInviteController.php:101
* @route '/admin/invites/shareable'
*/
export const shareable = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: shareable.url(options),
    method: 'post',
})

shareable.definition = {
    methods: ["post"],
    url: '/admin/invites/shareable',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationInviteController::shareable
* @see app/Http/Controllers/CorporationInviteController.php:101
* @route '/admin/invites/shareable'
*/
shareable.url = (options?: RouteQueryOptions) => {
    return shareable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationInviteController::shareable
* @see app/Http/Controllers/CorporationInviteController.php:101
* @route '/admin/invites/shareable'
*/
shareable.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: shareable.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CorporationInviteController::shareable
* @see app/Http/Controllers/CorporationInviteController.php:101
* @route '/admin/invites/shareable'
*/
const shareableForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: shareable.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CorporationInviteController::shareable
* @see app/Http/Controllers/CorporationInviteController.php:101
* @route '/admin/invites/shareable'
*/
shareableForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: shareable.url(options),
    method: 'post',
})

shareable.form = shareableForm

/**
* @see \App\Http\Controllers\CorporationInviteController::email
* @see app/Http/Controllers/CorporationInviteController.php:141
* @route '/admin/invites/email'
*/
export const email = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: email.url(options),
    method: 'post',
})

email.definition = {
    methods: ["post"],
    url: '/admin/invites/email',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CorporationInviteController::email
* @see app/Http/Controllers/CorporationInviteController.php:141
* @route '/admin/invites/email'
*/
email.url = (options?: RouteQueryOptions) => {
    return email.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CorporationInviteController::email
* @see app/Http/Controllers/CorporationInviteController.php:141
* @route '/admin/invites/email'
*/
email.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: email.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CorporationInviteController::email
* @see app/Http/Controllers/CorporationInviteController.php:141
* @route '/admin/invites/email'
*/
const emailForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: email.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CorporationInviteController::email
* @see app/Http/Controllers/CorporationInviteController.php:141
* @route '/admin/invites/email'
*/
emailForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: email.url(options),
    method: 'post',
})

email.form = emailForm

/**
* @see \App\Http\Controllers\CorporationInviteController::destroy
* @see app/Http/Controllers/CorporationInviteController.php:181
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
* @see app/Http/Controllers/CorporationInviteController.php:181
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
* @see app/Http/Controllers/CorporationInviteController.php:181
* @route '/admin/invites/{invite}'
*/
destroy.delete = (args: { invite: number | { id: number } } | [invite: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\CorporationInviteController::destroy
* @see app/Http/Controllers/CorporationInviteController.php:181
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
* @see app/Http/Controllers/CorporationInviteController.php:181
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

const invites = {
    index: Object.assign(index, index),
    shareable: Object.assign(shareable, shareable),
    email: Object.assign(email, email),
    destroy: Object.assign(destroy, destroy),
}

export default invites