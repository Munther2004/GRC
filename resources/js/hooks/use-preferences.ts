import { useCallback, useSyncExternalStore } from 'react';

// ── Radius ────────────────────────────────────────────────────────────────────
export type RadiusPreset = 'none' | 'subtle' | 'default' | 'rounded' | 'pill';
export const RADIUS_PRESETS: { name: RadiusPreset; label: string; value: string; description: string }[] = [
    { name: 'none',    label: 'None',    value: '0rem',     description: 'Sharp corners — precise and technical' },
    { name: 'subtle',  label: 'Subtle',  value: '0.15rem',  description: 'Barely-there rounding — almost sharp' },
    { name: 'default', label: 'Default', value: '0.25rem',  description: 'The GRC standard — clean and balanced' },
    { name: 'rounded', label: 'Rounded', value: '0.5rem',   description: 'Friendly rounded corners — approachable' },
    { name: 'pill',    label: 'Pill',    value: '0.75rem',  description: 'Maximum rounding — modern and soft' },
];

// ── Density ───────────────────────────────────────────────────────────────────
export type DensityPreset = 'compact' | 'default' | 'comfortable';
export const DENSITY_PRESETS: { name: DensityPreset; label: string; description: string; vars: Record<string, string> }[] = [
    {
        name: 'compact',
        label: 'Compact',
        description: 'Tighter spacing — more content on screen',
        vars: { '--spacing-scale': '0.85', '--line-height-scale': '1.4' },
    },
    {
        name: 'default',
        label: 'Default',
        description: 'Balanced spacing — the GRC standard',
        vars: { '--spacing-scale': '1', '--line-height-scale': '1.65' },
    },
    {
        name: 'comfortable',
        label: 'Comfortable',
        description: 'Generous breathing room — relaxed reading',
        vars: { '--spacing-scale': '1.15', '--line-height-scale': '1.9' },
    },
];

// ── Motion ────────────────────────────────────────────────────────────────────
export type MotionPreset = 'full' | 'reduced' | 'none';
export const MOTION_PRESETS: { name: MotionPreset; label: string; description: string }[] = [
    { name: 'full',    label: 'Full',    description: 'All animations and transitions enabled' },
    { name: 'reduced', label: 'Reduced', description: 'Subtle transitions only — no decorative motion' },
    { name: 'none',    label: 'None',    description: 'Zero motion — instant state changes' },
];

// ── Sidebar width ─────────────────────────────────────────────────────────────
export type SidebarWidth = 'compact' | 'default' | 'wide';
export const SIDEBAR_WIDTHS: { name: SidebarWidth; label: string; value: string; description: string }[] = [
    { name: 'compact', label: 'Compact', value: '14rem', description: 'Narrower sidebar — more content width' },
    { name: 'default', label: 'Default', value: '16rem', description: 'Standard sidebar width' },
    { name: 'wide',    label: 'Wide',    value: '18rem', description: 'Wider sidebar — more label space' },
];

// ── State ─────────────────────────────────────────────────────────────────────
interface Preferences {
    radius: RadiusPreset;
    density: DensityPreset;
    motion: MotionPreset;
    sidebarWidth: SidebarWidth;
}

const STORAGE_KEY = 'grc-preferences';
const DEFAULTS: Preferences = { radius: 'default', density: 'default', motion: 'full', sidebarWidth: 'default' };

const listeners = new Set<() => void>();
let current: Preferences = { ...DEFAULTS };
const notify = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };

function applyPreferences(prefs: Preferences): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const existing = document.getElementById('grc-pref-vars');
    if (existing) existing.remove();

    const radius = RADIUS_PRESETS.find((r) => r.name === prefs.radius) ?? RADIUS_PRESETS[2];
    const density = DENSITY_PRESETS.find((d) => d.name === prefs.density) ?? DENSITY_PRESETS[1];
    const sidebar = SIDEBAR_WIDTHS.find((s) => s.name === prefs.sidebarWidth) ?? SIDEBAR_WIDTHS[1];

    const style = document.createElement('style');
    style.id = 'grc-pref-vars';

    const motionCSS = prefs.motion === 'none'
        ? `*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }`
        : prefs.motion === 'reduced'
        ? `@media (prefers-reduced-motion: no-preference) { *, *::before, *::after { animation-duration: 150ms !important; transition-duration: 100ms !important; } }`
        : '';

    style.textContent = `
        :root {
            --radius: ${radius.value};
            --sidebar-width: ${sidebar.value};
            ${Object.entries(density.vars).map(([k, v]) => `${k}: ${v};`).join('\n            ')}
        }
        @media (min-width: 64rem) {
            aside.lg\\:w-64 { width: ${sidebar.value} !important; }
            .lg\\:pl-64 { padding-left: ${sidebar.value} !important; }
        }
        ${motionCSS}
    `;
    document.head.appendChild(style);

    root.setAttribute('data-radius', prefs.radius);
    root.setAttribute('data-density', prefs.density);
    root.setAttribute('data-motion', prefs.motion);
}

export function initializePreferences(): void {
    if (typeof window === 'undefined') return;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        current = stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
    } catch {
        current = { ...DEFAULTS };
    }
    applyPreferences(current);
}

export function usePreferences(): {
    preferences: Preferences;
    setRadius: (v: RadiusPreset) => void;
    setDensity: (v: DensityPreset) => void;
    setMotion: (v: MotionPreset) => void;
    setSidebarWidth: (v: SidebarWidth) => void;
    radiusPresets: typeof RADIUS_PRESETS;
    densityPresets: typeof DENSITY_PRESETS;
    motionPresets: typeof MOTION_PRESETS;
    sidebarWidths: typeof SIDEBAR_WIDTHS;
} {
    const preferences = useSyncExternalStore(subscribe, () => current, () => DEFAULTS);

    const update = useCallback((patch: Partial<Preferences>) => {
        current = { ...current, ...patch };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        applyPreferences(current);
        notify();
    }, []);

    return {
        preferences,
        setRadius:      (v) => update({ radius: v }),
        setDensity:     (v) => update({ density: v }),
        setMotion:      (v) => update({ motion: v }),
        setSidebarWidth: (v) => update({ sidebarWidth: v }),
        radiusPresets:   RADIUS_PRESETS,
        densityPresets:  DENSITY_PRESETS,
        motionPresets:   MOTION_PRESETS,
        sidebarWidths:   SIDEBAR_WIDTHS,
    };
}
