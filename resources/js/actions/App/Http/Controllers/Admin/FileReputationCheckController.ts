import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::check
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
export const check = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(args, options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/admin/evidence/{evidence}/reputation-check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::check
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
check.url = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return check.definition.url
            .replace('{evidence}', parsedArgs.evidence.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::check
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
check.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::check
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
    const checkForm = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: check.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::check
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:19
 * @route '/admin/evidence/{evidence}/reputation-check'
 */
        checkForm.post = (args: { evidence: number | { id: number } } | [evidence: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: check.url(args, options),
            method: 'post',
        })
    
    check.form = checkForm
/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::checkSecurityAudit
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
 * @route '/admin/security-audits/{securityAudit}/reputation-check'
 */
export const checkSecurityAudit = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkSecurityAudit.url(args, options),
    method: 'post',
})

checkSecurityAudit.definition = {
    methods: ["post"],
    url: '/admin/security-audits/{securityAudit}/reputation-check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::checkSecurityAudit
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
 * @route '/admin/security-audits/{securityAudit}/reputation-check'
 */
checkSecurityAudit.url = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return checkSecurityAudit.definition.url
            .replace('{securityAudit}', parsedArgs.securityAudit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::checkSecurityAudit
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
 * @route '/admin/security-audits/{securityAudit}/reputation-check'
 */
checkSecurityAudit.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkSecurityAudit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::checkSecurityAudit
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
 * @route '/admin/security-audits/{securityAudit}/reputation-check'
 */
    const checkSecurityAuditForm = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: checkSecurityAudit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\FileReputationCheckController::checkSecurityAudit
 * @see app/Http/Controllers/Admin/FileReputationCheckController.php:42
 * @route '/admin/security-audits/{securityAudit}/reputation-check'
 */
        checkSecurityAuditForm.post = (args: { securityAudit: number | { id: number } } | [securityAudit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: checkSecurityAudit.url(args, options),
            method: 'post',
        })
    
    checkSecurityAudit.form = checkSecurityAuditForm
const FileReputationCheckController = { check, checkSecurityAudit }

export default FileReputationCheckController