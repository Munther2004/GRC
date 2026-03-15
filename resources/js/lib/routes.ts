export const route = (name: string, params?: any): string => {
    const id = typeof params === 'object' && params !== null
        ? (params.id ?? Object.values(params)[0])
        : params;

    const routes: Record<string, string> = {
        // Dashboard
        'dashboard': '/dashboard',

        // Risks
        'risks.index':          '/risks',
        'risks.create':         '/risks/create',
        'risks.store':          '/risks',
        'risks.show':           `/risks/${id}`,
        'risks.edit':           `/risks/${id}/edit`,
        'risks.update':         `/risks/${id}`,
        'risks.destroy':        `/risks/${id}`,
        'risks.link-control':   `/risks/${id}/link-control`,
        'risks.unlink-control': `/risks/${id}/unlink-control`,

        // Assessments
        'assessments.index':         '/assessments',
        'assessments.create':        '/assessments/create',
        'assessments.store':         '/assessments',
        'assessments.show':          `/assessments/${id}`,
        'assessments.edit':          `/assessments/${id}/edit`,
        'assessments.update':        `/assessments/${id}`,
        'assessments.destroy':       `/assessments/${id}`,
        'assessments.questionnaire': `/assessments/${id}/questionnaire`,
        'assessments.export-pdf':    `/assessments/${id}/export-pdf`,
        'assessments.save-answers':  `/assessments/${id}/save-answers`,
        'assessments.submit':        `/assessments/${id}/submit`,

        // Admin — Users
        'admin.users.index':   '/admin/users',
        'admin.users.create':  '/admin/users/create',
        'admin.users.store':   '/admin/users',
        'admin.users.edit':    `/admin/users/${id}/edit`,
        'admin.users.update':  `/admin/users/${id}`,
        'admin.users.destroy': `/admin/users/${id}`,

        // Admin — Frameworks
        'admin.frameworks.index':  '/admin/frameworks',
        'admin.frameworks.edit':   `/admin/frameworks/${id}/edit`,
        'admin.frameworks.update': `/admin/frameworks/${id}`,
        'admin.frameworks.toggle': `/admin/frameworks/${id}/toggle`,

        // Admin — Controls
        'admin.controls.index':   '/admin/controls',
        'admin.controls.edit':    `/admin/controls/${id}/edit`,
        'admin.controls.update':  `/admin/controls/${id}`,
        'admin.controls.destroy': `/admin/controls/${id}`,

        //Reports
        'reports.index':      '/reports',
        'reports.export-pdf': '/reports/export-pdf',
        
        // Audit Logs
        'audit-logs.index': '/audit-logs',

        //Gap Analysis
        'gap-analysis.index': '/gap-analysis',

        // Notifications
        'notifications.index':   '/notifications',
        'notifications.read':    `/notifications/${id}/read`,
        'notifications.read-all': '/notifications/read-all',
        'notifications.destroy': `/notifications/${id}`,

        //Evidence
        'evidence.index':    '/evidence',
        'evidence.approve':  `/evidence/${id}/approve`,
        'evidence.reject':   `/evidence/${id}/reject`,
        'evidence.download': `/evidence/${id}/download`,
        'evidence.destroy':  `/evidence/${id}`,
    };

    return routes[name] ?? `/${name.replace('.', '/')}`;
};