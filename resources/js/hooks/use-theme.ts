import { useCallback, useSyncExternalStore } from 'react';
import { applyTheme, DEFAULT_THEME, getTheme, THEMES } from '@/lib/themes';
import type { Theme } from '@/lib/themes';

const STORAGE_KEY = 'grc-theme';

const listeners = new Set<() => void>();
let currentThemeName: string = DEFAULT_THEME;

const notify = (): void => listeners.forEach((l) => l());

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export function initializeThemePreset(): void {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
    currentThemeName = stored;
    applyTheme(getTheme(stored));
}

export function useTheme(): {
    theme: Theme;
    themeName: string;
    setTheme: (name: string) => void;
    themes: Theme[];
} {
    const themeName = useSyncExternalStore(
        subscribe,
        () => currentThemeName,
        () => DEFAULT_THEME,
    );

    const setTheme = useCallback((name: string) => {
        currentThemeName = name;
        localStorage.setItem(STORAGE_KEY, name);
        applyTheme(getTheme(name));
        notify();
    }, []);

    return {
        theme: getTheme(themeName),
        themeName,
        setTheme,
        themes: THEMES,
    };
}
