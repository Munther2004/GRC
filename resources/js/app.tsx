import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { initializeTheme } from '@/hooks/use-appearance';
import { initializeFont } from '@/hooks/use-font';
import { initializePreferences } from '@/hooks/use-preferences';
import { initializeThemePreset } from '@/hooks/use-theme';
import { route } from '@/lib/routes';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Make route() available globally
(window as any).route = route;

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <StrictMode>
                <ConfirmProvider>
                    <App {...props} />
                </ConfirmProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeThemePreset();
initializeFont();
initializePreferences();
// Run last so the appearance-driven preset (light/dark) wins over the stored grc-theme preset.
initializeTheme();
