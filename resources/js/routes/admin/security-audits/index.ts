import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
* @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
* @route '/admin/security-audits/{securityAudit}/reputation-check'
*/
export const reputationCheck = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reputationCheck.url(args, options),
    method: 'post',
})

reputationCheck.definition = {
    methods: ["post"],
    url: '/admin/security-audits/{securityAudit}/reputation-check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
* @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
* @route '/admin/security-audits/{securityAudit}/reputation-check'
*/
reputationCheck.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reputationCheck.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
* @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
* @route '/admin/security-audits/{securityAudit}/reputation-check'
*/
reputationCheck.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reputationCheck.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
* @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
* @route '/admin/security-audits/{securityAudit}/reputation-check'
*/
const reputationCheckForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reputationCheck.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::reputationCheck
* @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
* @route '/admin/security-audits/{securityAudit}/reputation-check'
*/
reputationCheckForm.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reputationCheck.url(args, options),
    method: 'post',
})

reputationCheck.form = reputationCheckForm

const securityAudits = {
    reputationCheck: Object.assign(reputationCheck, reputationCheck),
}

export default securityAudits