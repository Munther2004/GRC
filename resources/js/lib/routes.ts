export const route = (name: string, params?: any): string => {
    const id =
        typeof params === 'object' && params !== null
            ? (params.id ?? Object.values(params)[0])
            : params;

    const routes: Record<string, string> = {
        // Dashboard
        dashboard: '/dashboard',

        // Risks
        'risks.index': '/risks',
        'risks.create': '/risks/create',
        'risks.store': '/risks',
        'risks.show': `/risks/${id}`,
        'risks.edit': `/risks/${id}/edit`,
        'risks.update': `/risks/${id}`,
        'risks.destroy': `/risks/${id}`,
        'risks.link-control': `/risks/${id}/link-control`,
        'risks.unlink-control': `/risks/${id}/unlink-control`,

        // Assessments
        'assessments.index': '/assessments',
        'assessments.create': '/assessments/create',
        'assessments.store': '/assessments',
        'assessments.show': `/assessments/${id}`,
        'assessments.edit': `/assessments/${id}/edit`,
        'assessments.update': `/assessments/${id}`,
        'assessments.destroy': `/assessments/${id}`,
        'assessments.questionnaire': `/assessments/${id}/questionnaire`,
        'assessments.export-pdf': `/assessments/${id}/export-pdf`,
        'assessments.save-answers': `/assessments/${id}/save-answers`,
        'assessments.submit': `/assessments/${id}/submit`,
        'assessments.auto-fill': `/assessments/${id}/auto-fill`,
        'assessments.explain-control': '/assessments/explain-control',

        // Admin — Users
        'admin.users.index': '/admin/users',
        'admin.users.create': '/admin/users/create',
        'admin.users.store': '/admin/users',
        'admin.users.edit': `/admin/users/${id}/edit`,
        'admin.users.update': `/admin/users/${id}`,
        'admin.users.destroy': `/admin/users/${id}`,

        // Admin — Frameworks
        'admin.frameworks.index': '/admin/frameworks',
        'admin.frameworks.edit': `/admin/frameworks/${id}/edit`,
        'admin.frameworks.update': `/admin/frameworks/${id}`,
        'admin.frameworks.toggle': `/admin/frameworks/${id}/toggle`,

        // Admin — Controls
        'admin.controls.index': '/admin/controls',
        'admin.controls.edit': `/admin/controls/${id}/edit`,
        'admin.controls.update': `/admin/controls/${id}`,
        'admin.controls.destroy': `/admin/controls/${id}`,

        //Reports
        'reports.index': '/reports',
        'reports.export-pdf': '/reports/export-pdf',

        // Audit Logs
        'audit-logs.index': '/audit-logs',

        //Gap Analysis
        'gap-analysis.index': '/gap-analysis',

        // Controls Hub
        'controls.hub': '/controls/hub',
        'controls.update-status': `/controls/${id}/update-status`,
        'controls.history': `/controls/${id}/history`,
        'controls.request-status': `/controls/${id}/request-status`,
        'controls.status-requests.approve': `/controls/status-requests/${id}/approve`,
        'controls.status-requests.reject': `/controls/status-requests/${id}/reject`,
        'controls.status-requests.review-evidence': `/controls/status-requests/${id}/review-evidence`,
        'controls.approvals': '/controls/approvals',

        // Corporate dashboard (manager)
        'corporate.dashboard': '/corporate/dashboard',
        'corporate.company-details': '/corporate/company-details',
        'corporate.team': '/corporate/team',
        'corporate.show-dashboard': `/corporate/${id}/dashboard`,

        // Corporations
        'corporations.register': '/corporation/register',
        'corporations.store': '/corporation/register',
        'corporations.registration-pending': `/corporation/${id}/pending`,
        'corporations.verify-code': `/corporation/${id}/verify-code`,
        'corporations.manager-signup': `/corporation/${id}/manager-signup`,
        'corporations.manager-register': `/corporation/${id}/manager-signup`,

        // Admin — Corporations
        'admin.corporations.index': '/admin/corporations',
        'admin.corporations.show': `/admin/corporations/${id}`,
        'admin.corporations.destroy': `/admin/corporations/${id}`,
        'admin.corporations.approve': `/admin/corporations/${id}/approve`,
        'admin.corporations.reject': `/admin/corporations/${id}/reject`,
        'admin.corporations.regenerate-code': `/admin/corporations/${id}/regenerate-code`,

        // Notifications
        'notifications.index': '/notifications',
        'notifications.read': `/notifications/${id}/read`,
        'notifications.read-all': '/notifications/read-all',
        'notifications.destroy': `/notifications/${id}`,

        // Evidence Coverage Matrix
        'evidence-coverage.index': '/evidence-coverage',

        //Evidence
        'evidence.index': '/evidence',
        'evidence.approve': `/evidence/${id}/approve`,
        'evidence.reject': `/evidence/${id}/reject`,
        'evidence.download': `/evidence/${id}/download`,
        'evidence.destroy': `/evidence/${id}`,
        'evidence.ai-review': `/evidence/${id}/ai-review`,

        // Admin — File Reputation Checks (VirusTotal)
        'admin.evidence.reputation-check': `/admin/evidence/${id}/reputation-check`,
        'admin.security-audits.reputation-check': `/admin/security-audits/${id}/reputation-check`,
    };

    return routes[name] ?? `/${name.replace('.', '/')}`;
};
