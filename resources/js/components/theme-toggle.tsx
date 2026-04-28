import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

type Props = {
    compact?: boolean;
    className?: string;
};

/**
 * Visible light/dark toggle pill. Reuses the existing useAppearance hook —
 * persists to localStorage (and mirrors via cookie for SSR), respects system
 * preference on first load, and switches the active theme preset to
 * `cohere-light` or `forest-grc` when toggled.
 */
export function ThemeToggle({ compact = false, className = '' }: Props) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const next = isDark ? 'light' : 'dark';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(next)}
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
            className={`relative inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-all ${className}`}
            style={{
                color: 'var(--foreground)',
                background: 'color-mix(in srgb, var(--card) 70%, transparent)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <span
                className="relative inline-flex h-4 w-7 items-center rounded-full"
                style={{
                    background: isDark
                        ? 'color-mix(in srgb, var(--primary) 35%, transparent)'
                        : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
                    border: '1px solid var(--border)',
                }}
            >
                <span
                    className="absolute top-1/2 flex h-3 w-3 -translate-y-1/2 items-center justify-center rounded-full transition-all"
                    style={{
                        left: isDark ? '14px' : '2px',
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                    }}
                >
                    {isDark ? <Moon className="h-2 w-2" /> : <Sun className="h-2 w-2" />}
                </span>
            </span>
            {!compact && (
                <span style={{ color: 'var(--muted-foreground)' }}>{isDark ? 'Dark' : 'Light'}</span>
            )}
        </button>
    );
}

export default ThemeToggle;
