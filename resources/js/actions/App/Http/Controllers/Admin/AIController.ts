import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AIController::suggestThreats
* @see app/Http/Controllers/Admin/AIController.php:20
* @route '/ai/suggest-threats'
*/
export const suggestThreats = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suggestThreats.url(options),
    method: 'post',
})

suggestThreats.definition = {
    methods: ["post"],
    url: '/ai/suggest-threats',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIController::suggestThreats
* @see app/Http/Controllers/Admin/AIController.php:20
* @route '/ai/suggest-threats'
*/
suggestThreats.url = (options?: RouteQueryOptions) => {
    return suggestThreats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIController::suggestThreats
* @see app/Http/Controllers/Admin/AIController.php:20
* @route '/ai/suggest-threats'
*/
suggestThreats.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suggestThreats.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::suggestThreats
* @see app/Http/Controllers/Admin/AIController.php:20
* @route '/ai/suggest-threats'
*/
const suggestThreatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: suggestThreats.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::suggestThreats
* @see app/Http/Controllers/Admin/AIController.php:20
* @route '/ai/suggest-threats'
*/
suggestThreatsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: suggestThreats.url(options),
    method: 'post',
})

suggestThreats.form = suggestThreatsForm

/**
* @see \App\Http\Controllers\Admin\AIController::remediateGap
* @see app/Http/Controllers/Admin/AIController.php:84
* @route '/ai/remediate-gap'
*/
export const remediateGap = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remediateGap.url(options),
    method: 'post',
})

remediateGap.definition = {
    methods: ["post"],
    url: '/ai/remediate-gap',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIController::remediateGap
* @see app/Http/Controllers/Admin/AIController.php:84
* @route '/ai/remediate-gap'
*/
remediateGap.url = (options?: RouteQueryOptions) => {
    return remediateGap.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIController::remediateGap
* @see app/Http/Controllers/Admin/AIController.php:84
* @route '/ai/remediate-gap'
*/
remediateGap.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remediateGap.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::remediateGap
* @see app/Http/Controllers/Admin/AIController.php:84
* @route '/ai/remediate-gap'
*/
const remediateGapForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remediateGap.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::remediateGap
* @see app/Http/Controllers/Admin/AIController.php:84
* @route '/ai/remediate-gap'
*/
remediateGapForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remediateGap.url(options),
    method: 'post',
})

remediateGap.form = remediateGapForm

/**
* @see \App\Http\Controllers\Admin\AIController::saveRemediation
* @see app/Http/Controllers/Admin/AIController.php:158
* @route '/ai/save-remediation'
*/
export const saveRemediation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveRemediation.url(options),
    method: 'post',
})

saveRemediation.definition = {
    methods: ["post"],
    url: '/ai/save-remediation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIController::saveRemediation
* @see app/Http/Controllers/Admin/AIController.php:158
* @route '/ai/save-remediation'
*/
saveRemediation.url = (options?: RouteQueryOptions) => {
    return saveRemediation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIController::saveRemediation
* @see app/Http/Controllers/Admin/AIController.php:158
* @route '/ai/save-remediation'
*/
saveRemediation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveRemediation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::saveRemediation
* @see app/Http/Controllers/Admin/AIController.php:158
* @route '/ai/save-remediation'
*/
const saveRemediationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: saveRemediation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::saveRemediation
* @see app/Http/Controllers/Admin/AIController.php:158
* @route '/ai/save-remediation'
*/
saveRemediationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: saveRemediation.url(options),
    method: 'post',
})

saveRemediation.form = saveRemediationForm

/**
* @see \App\Http\Controllers\Admin\AIController::generateAssessmentSummary
* @see app/Http/Controllers/Admin/AIController.php:206
* @route '/ai/assessment-summary/{assessment}'
*/
export const generateAssessmentSummary = (args: { assessment: string | number } | [assessment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateAssessmentSummary.url(args, options),
    method: 'post',
})

generateAssessmentSummary.definition = {
    methods: ["post"],
    url: '/ai/assessment-summary/{assessment}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIController::generateAssessmentSummary
* @see app/Http/Controllers/Admin/AIController.php:206
* @route '/ai/assessment-summary/{assessment}'
*/
generateAssessmentSummary.url = (args: { assessment: string | number } | [assessment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assessment: args }
    }

    if (Array.isArray(args)) {
        args = {
            assessment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        assessment: args.assessment,
    }

    return generateAssessmentSummary.definition.url
            .replace('{assessment}', parsedArgs.assessment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIController::generateAssessmentSummary
* @see app/Http/Controllers/Admin/AIController.php:206
* @route '/ai/assessment-summary/{assessment}'
*/
generateAssessmentSummary.post = (args: { assessment: string | number } | [assessment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateAssessmentSummary.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::generateAssessmentSummary
* @see app/Http/Controllers/Admin/AIController.php:206
* @route '/ai/assessment-summary/{assessment}'
*/
const generateAssessmentSummaryForm = (args: { assessment: string | number } | [assessment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generateAssessmentSummary.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::generateAssessmentSummary
* @see app/Http/Controllers/Admin/AIController.php:206
* @route '/ai/assessment-summary/{assessment}'
*/
generateAssessmentSummaryForm.post = (args: { assessment: string | number } | [assessment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generateAssessmentSummary.url(args, options),
    method: 'post',
})

generateAssessmentSummary.form = generateAssessmentSummaryForm

/**
* @see \App\Http\Controllers\Admin\AIController::reviewEvidence
* @see app/Http/Controllers/Admin/AIController.php:312
* @route '/ai/review-evidence'
*/
export const reviewEvidence = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reviewEvidence.url(options),
    method: 'post',
})

reviewEvidence.definition = {
    methods: ["post"],
    url: '/ai/review-evidence',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIController::reviewEvidence
* @see app/Http/Controllers/Admin/AIController.php:312
* @route '/ai/review-evidence'
*/
reviewEvidence.url = (options?: RouteQueryOptions) => {
    return reviewEvidence.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIController::reviewEvidence
* @see app/Http/Controllers/Admin/AIController.php:312
* @route '/ai/review-evidence'
*/
reviewEvidence.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reviewEvidence.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::reviewEvidence
* @see app/Http/Controllers/Admin/AIController.php:312
* @route '/ai/review-evidence'
*/
const reviewEvidenceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reviewEvidence.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIController::reviewEvidence
* @see app/Http/Controllers/Admin/AIController.php:312
* @route '/ai/review-evidence'
*/
reviewEvidenceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reviewEvidence.url(options),
    method: 'post',
})

reviewEvidence.form = reviewEvidenceForm

const AIController = { suggestThreats, remediateGap, saveRemediation, generateAssessmentSummary, reviewEvidence }

export default AIController