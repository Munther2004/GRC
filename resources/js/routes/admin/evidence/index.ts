import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
export const reputationCheck = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reputationCheck.url(args, options),
    method: 'post',
})

reputationCheck.definition = {
    methods: ["post"],
    url: '/admin/evidence/{evidence}/reputation-check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
reputationCheck.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reputationCheck.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
reputationCheck.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reputationCheck.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
    const reputationCheckForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reputationCheck.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
        reputationCheckForm.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reputationCheck.url(args, options),
            method: 'post',
        })
    
    reputationCheck.form = reputationCheckForm
const evidence = {
    reputationCheck: Object.assign(reputationCheck, reputationCheck),
}

export default evidence