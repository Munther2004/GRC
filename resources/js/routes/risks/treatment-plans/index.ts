import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::store
* @see app/Http/Controllers/RiskTreatmentPlanController.php:12
* @route '/risks/{risk}/treatment-plans'
*/
export const store = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/risks/{risk}/treatment-plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::store
* @see app/Http/Controllers/RiskTreatmentPlanController.php:12
* @route '/risks/{risk}/treatment-plans'
*/
store.url = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::store
* @see app/Http/Controllers/RiskTreatmentPlanController.php:12
* @route '/risks/{risk}/treatment-plans'
*/
store.post = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::store
* @see app/Http/Controllers/RiskTreatmentPlanController.php:12
* @route '/risks/{risk}/treatment-plans'
*/
const storeForm = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::store
* @see app/Http/Controllers/RiskTreatmentPlanController.php:12
* @route '/risks/{risk}/treatment-plans'
*/
storeForm.post = (args: { risk: number | { id: number } } | [risk: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::update
* @see app/Http/Controllers/RiskTreatmentPlanController.php:37
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
export const update = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/risks/{risk}/treatment-plans/{plan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::update
* @see app/Http/Controllers/RiskTreatmentPlanController.php:37
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
update.url = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            risk: args[0],
            plan: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
        plan: typeof args.plan === 'object'
        ? args.plan.id
        : args.plan,
    }

    return update.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::update
* @see app/Http/Controllers/RiskTreatmentPlanController.php:37
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
update.put = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::update
* @see app/Http/Controllers/RiskTreatmentPlanController.php:37
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
const updateForm = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::update
* @see app/Http/Controllers/RiskTreatmentPlanController.php:37
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
updateForm.put = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RiskTreatmentPlanController::destroy
* @see app/Http/Controllers/RiskTreatmentPlanController.php:74
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
export const destroy = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/risks/{risk}/treatment-plans/{plan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::destroy
* @see app/Http/Controllers/RiskTreatmentPlanController.php:74
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
destroy.url = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            risk: args[0],
            plan: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        risk: typeof args.risk === 'object'
        ? args.risk.id
        : args.risk,
        plan: typeof args.plan === 'object'
        ? args.plan.id
        : args.plan,
    }

    return destroy.definition.url
            .replace('{risk}', parsedArgs.risk.toString())
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::destroy
* @see app/Http/Controllers/RiskTreatmentPlanController.php:74
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
destroy.delete = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::destroy
* @see app/Http/Controllers/RiskTreatmentPlanController.php:74
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
const destroyForm = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RiskTreatmentPlanController::destroy
* @see app/Http/Controllers/RiskTreatmentPlanController.php:74
* @route '/risks/{risk}/treatment-plans/{plan}'
*/
destroyForm.delete = (args: { risk: number | { id: number }, plan: number | { id: number } } | [risk: number | { id: number }, plan: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const treatmentPlans = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default treatmentPlans