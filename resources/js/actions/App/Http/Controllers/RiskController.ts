import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/risks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::index
* @see app/Http/Controllers/RiskController.php:22
* @route '/risks'
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
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
export const heatmap = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: heatmap.url(options),
    method: 'get',
})

heatmap.definition = {
    methods: ["get","head"],
    url: '/risks/heatmap',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
heatmap.url = (options?: RouteQueryOptions) => {
    return heatmap.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
heatmap.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: heatmap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
heatmap.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: heatmap.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
const heatmapForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: heatmap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
heatmapForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: heatmap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::heatmap
* @see app/Http/Controllers/RiskController.php:404
* @route '/risks/heatmap'
*/
heatmapForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: heatmap.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

heatmap.form = heatmapForm

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/risks/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::create
* @see app/Http/Controllers/RiskController.php:105
* @route '/risks/create'
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
* @see \App\Http\Controllers\RiskController::validateScores
* @see app/Http/Controllers/RiskController.php:284
* @route '/risks/validate-scores'
*/
export const validateScores = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validateScores.url(options),
    method: 'post',
})

validateScores.definition = {
    methods: ["post"],
    url: '/risks/validate-scores',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskController::validateScores
* @see app/Http/Controllers/RiskController.php:284
* @route '/risks/validate-scores'
*/
validateScores.url = (options?: RouteQueryOptions) => {
    return validateScores.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::validateScores
* @see app/Http/Controllers/RiskController.php:284
* @route '/risks/validate-scores'
*/
validateScores.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validateScores.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::validateScores
* @see app/Http/Controllers/RiskController.php:284
* @route '/risks/validate-scores'
*/
const validateScoresForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: validateScores.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::validateScores
* @see app/Http/Controllers/RiskController.php:284
* @route '/risks/validate-scores'
*/
validateScoresForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: validateScores.url(options),
    method: 'post',
})

validateScores.form = validateScoresForm

/**
* @see \App\Http\Controllers\RiskController::store
* @see app/Http/Controllers/RiskController.php:114
* @route '/risks'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/risks',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskController::store
* @see app/Http/Controllers/RiskController.php:114
* @route '/risks'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::store
* @see app/Http/Controllers/RiskController.php:114
* @route '/risks'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::store
* @see app/Http/Controllers/RiskController.php:114
* @route '/risks'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::store
* @see app/Http/Controllers/RiskController.php:114
* @route '/risks'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
export const edit = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/risks/{risk}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
edit.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { risk: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { risk: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            risk: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
    }

    return edit.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
edit.get = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
edit.head = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
const editForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
editForm.get = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::edit
* @see app/Http/Controllers/RiskController.php:212
* @route '/risks/{risk}/edit'
*/
editForm.head = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\RiskController::update
* @see app/Http/Controllers/RiskController.php:227
* @route '/risks/{risk}'
*/
export const update = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/risks/{risk}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\RiskController::update
* @see app/Http/Controllers/RiskController.php:227
* @route '/risks/{risk}'
*/
update.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { risk: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { risk: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            risk: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
    }

    return update.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::update
* @see app/Http/Controllers/RiskController.php:227
* @route '/risks/{risk}'
*/
update.put = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\RiskController::update
* @see app/Http/Controllers/RiskController.php:227
* @route '/risks/{risk}'
*/
const updateForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::update
* @see app/Http/Controllers/RiskController.php:227
* @route '/risks/{risk}'
*/
updateForm.put = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\RiskController::destroy
* @see app/Http/Controllers/RiskController.php:261
* @route '/risks/{risk}'
*/
export const destroy = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/risks/{risk}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RiskController::destroy
* @see app/Http/Controllers/RiskController.php:261
* @route '/risks/{risk}'
*/
destroy.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { risk: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { risk: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            risk: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
    }

    return destroy.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::destroy
* @see app/Http/Controllers/RiskController.php:261
* @route '/risks/{risk}'
*/
destroy.delete = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RiskController::destroy
* @see app/Http/Controllers/RiskController.php:261
* @route '/risks/{risk}'
*/
const destroyForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::destroy
* @see app/Http/Controllers/RiskController.php:261
* @route '/risks/{risk}'
*/
destroyForm.delete = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RiskController::linkControl
* @see app/Http/Controllers/RiskController.php:309
* @route '/risks/{risk}/link-control'
*/
export const linkControl = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: linkControl.url(args, options),
    method: 'post',
})

linkControl.definition = {
    methods: ["post"],
    url: '/risks/{risk}/link-control',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskController::linkControl
* @see app/Http/Controllers/RiskController.php:309
* @route '/risks/{risk}/link-control'
*/
linkControl.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { risk: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { risk: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            risk: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
    }

    return linkControl.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::linkControl
* @see app/Http/Controllers/RiskController.php:309
* @route '/risks/{risk}/link-control'
*/
linkControl.post = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: linkControl.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::linkControl
* @see app/Http/Controllers/RiskController.php:309
* @route '/risks/{risk}/link-control'
*/
const linkControlForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: linkControl.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::linkControl
* @see app/Http/Controllers/RiskController.php:309
* @route '/risks/{risk}/link-control'
*/
linkControlForm.post = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: linkControl.url(args, options),
    method: 'post',
})

linkControl.form = linkControlForm

/**
* @see \App\Http\Controllers\RiskController::unlinkControl
* @see app/Http/Controllers/RiskController.php:329
* @route '/risks/{risk}/unlink-control'
*/
export const unlinkControl = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unlinkControl.url(args, options),
    method: 'post',
})

unlinkControl.definition = {
    methods: ["post"],
    url: '/risks/{risk}/unlink-control',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskController::unlinkControl
* @see app/Http/Controllers/RiskController.php:329
* @route '/risks/{risk}/unlink-control'
*/
unlinkControl.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { risk: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { risk: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            risk: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
    }

    return unlinkControl.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::unlinkControl
* @see app/Http/Controllers/RiskController.php:329
* @route '/risks/{risk}/unlink-control'
*/
unlinkControl.post = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unlinkControl.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::unlinkControl
* @see app/Http/Controllers/RiskController.php:329
* @route '/risks/{risk}/unlink-control'
*/
const unlinkControlForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unlinkControl.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskController::unlinkControl
* @see app/Http/Controllers/RiskController.php:329
* @route '/risks/{risk}/unlink-control'
*/
unlinkControlForm.post = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unlinkControl.url(args, options),
    method: 'post',
})

unlinkControl.form = unlinkControlForm

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
export const show = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/risks/{risk}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
show.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { risk: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { risk: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            risk: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
    }

    return show.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
show.get = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
show.head = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
const showForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
showForm.get = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RiskController::show
* @see app/Http/Controllers/RiskController.php:149
* @route '/risks/{risk}'
*/
showForm.head = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const RiskController = { index, heatmap, create, validateScores, store, edit, update, destroy, linkControl, unlinkControl, show }

export default RiskController