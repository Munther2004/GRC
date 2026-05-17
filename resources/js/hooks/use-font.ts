import { useCallback, useSyncExternalStore } from 'react';

export type FontName =
    | 'crimson-pro'
    | 'inter'
    | 'space-grotesk'
    | 'raleway'
    | 'nunito'
    | 'lato'
    | 'playfair'
    | 'merriweather'
    | 'eb-garamond'
    | 'cormorant'
    | 'jetbrains-mono'
    | 'source-code-pro'
    | 'fira-code'
    | 'dm-sans'
    | 'outfit'
    | 'syne'
    | 'cabinet-grotesk'
    | 'system';

export interface FontConfig {
    name: FontName;
    label: string;
    /** CSS font-family stack */
    stack: string;
    /** Google Fonts URL fragment (null = system/already loaded) */
    googleFont: string | null;
    description: string;
    category: 'serif' | 'sans' | 'mono' | 'display';
}

export const FONTS: FontConfig[] = [
    {
        name: 'crimson-pro',
        label: 'Crimson Pro',
        stack: "'Crimson Pro', Georgia, serif",
        googleFont: 'family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400',
        description: 'Elegant literary serif: the GRC default',
        category: 'serif',
    },
    {
        name: 'cormorant',
        label: 'Cormorant Garamond',
        stack: "'Cormorant Garamond', Georgia, serif",
        googleFont: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400',
        description: 'Classical Garamond revival: refined and scholarly',
        category: 'serif',
    },
    {
        name: 'playfair',
        label: 'Playfair Display',
        stack: "'Playfair Display', Georgia, serif",
        googleFont: 'family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400',
        description: 'Editorial serif with dramatic contrast',
        category: 'serif',
    },
    {
        name: 'merriweather',
        label: 'Merriweather',
        stack: "'Merriweather', Georgia, serif",
        googleFont: 'family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400',
        description: 'Readable newspaper serif: clear at any size',
        category: 'serif',
    },
    {
        name: 'eb-garamond',
        label: 'EB Garamond',
        stack: "'EB Garamond', Garamond, Georgia, serif",
        googleFont: 'family=EB+Garamond:ital,wght@0,400;0,500;1,400',
        description: 'Open-source Garamond: old-world typesetting',
        category: 'serif',
    },
    {
        name: 'inter',
        label: 'Inter',
        stack: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        googleFont: 'family=Inter:wght@300;400;500;600',
        description: 'The modern UI standard: clean and legible',
        category: 'sans',
    },
    {
        name: 'dm-sans',
        label: 'DM Sans',
        stack: "'DM Sans', -apple-system, sans-serif",
        googleFont: 'family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400',
        description: 'Geometric sans with optical sizing: contemporary',
        category: 'sans',
    },
    {
        name: 'space-grotesk',
        label: 'Space Grotesk',
        stack: "'Space Grotesk', -apple-system, sans-serif",
        googleFont: 'family=Space+Grotesk:wght@300;400;500;600',
        description: 'Quirky geometric sans: distinctive tech character',
        category: 'sans',
    },
    {
        name: 'outfit',
        label: 'Outfit',
        stack: "'Outfit', -apple-system, sans-serif",
        googleFont: 'family=Outfit:wght@300;400;500;600',
        description: 'Clean geometric with friendly proportions',
        category: 'sans',
    },
    {
        name: 'raleway',
        label: 'Raleway',
        stack: "'Raleway', -apple-system, sans-serif",
        googleFont: 'family=Raleway:ital,wght@0,300;0,400;0,500;1,400',
        description: 'Elegant thin sans: refined and airy',
        category: 'sans',
    },
    {
        name: 'syne',
        label: 'Syne',
        stack: "'Syne', -apple-system, sans-serif",
        googleFont: 'family=Syne:wght@400;500;600;700',
        description: 'Experimental display sans: bold and editorial',
        category: 'display',
    },
    {
        name: 'nunito',
        label: 'Nunito',
        stack: "'Nunito', -apple-system, sans-serif",
        googleFont: 'family=Nunito:ital,wght@0,300;0,400;0,500;1,400',
        description: 'Rounded and approachable: warm and friendly',
        category: 'sans',
    },
    {
        name: 'lato',
        label: 'Lato',
        stack: "'Lato', -apple-system, sans-serif",
        googleFont: 'family=Lato:ital,wght@0,300;0,400;0,700;1,400',
        description: 'Humanist sans: versatile corporate workhorse',
        category: 'sans',
    },
    {
        name: 'jetbrains-mono',
        label: 'JetBrains Mono',
        stack: "'JetBrains Mono', 'Courier New', monospace",
        googleFont: 'family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400',
        description: 'Developer mono: ligatures, crystal clear',
        category: 'mono',
    },
    {
        name: 'fira-code',
        label: 'Fira Code',
        stack: "'Fira Code', 'Courier New', monospace",
        googleFont: 'family=Fira+Code:wght@300;400;500',
        description: 'Programmer mono with beautiful ligatures',
        category: 'mono',
    },
    {
        name: 'source-code-pro',
        label: 'Source Code Pro',
        stack: "'Source Code Pro', 'Courier New', monospace",
        googleFont: 'family=Source+Code+Pro:ital,wght@0,300;0,400;0,500;1,400',
        description: 'Adobe mono: technical and precise',
        category: 'mono',
    },
    {
        name: 'system',
        label: 'System Default',
        stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        googleFont: null,
        description: 'OS native fonts: fastest, no loading',
        category: 'sans',
    },
];

const STORAGE_KEY = 'grc-font';

const listeners = new Set<() => void>();
let currentFont: FontName = 'crimson-pro';

const notify = (): void => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };

/** Load a Google Font dynamically if not already present */
function loadGoogleFont(fragment: string): void {
    if (typeof document === 'undefined') return;
    const id = `gfont-${fragment.replace(/[^a-z0-9]/gi, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fragment}&display=swap`;
    document.head.appendChild(link);
}

export function applyFont(fontName: FontName): void {
    if (typeof document === 'undefined') return;
    const config = FONTS.find((f) => f.name === fontName) ?? FONTS[0];

    // Lazy-load the font if needed
    if (config.googleFont) loadGoogleFont(config.googleFont);

    // Remove previous injected style
    document.getElementById('grc-font-vars')?.remove();

    const style = document.createElement('style');
    style.id = 'grc-font-vars';
    // Override both CSS variables AND direct element font-family rules
    // so fonts apply regardless of whether Tailwind inlines the value
    style.textContent = `
        :root {
            --font-sans:    ${config.stack};
            --font-heading: ${config.stack};
            --font-display: ${config.stack};
            --font-body:    ${config.stack};
        }
        body, input, textarea, select, button {
            font-family: ${config.stack};
        }
        h1, h2, h3, h4, h5, h6,
        .font-heading, .font-display, .font-body, .font-sans {
            font-family: ${config.stack};
        }
    `;
    document.head.appendChild(style);
    document.documentElement.setAttribute('data-font', fontName);
}

export function initializeFont(): void {
    if (typeof window === 'undefined') return;
    const stored = (localStorage.getItem(STORAGE_KEY) as FontName) ?? 'crimson-pro';
    currentFont = stored;
    applyFont(currentFont);
}

export function useFont(): {
    font: FontName;
    setFont: (name: FontName) => void;
    fonts: FontConfig[];
} {
    const font = useSyncExternalStore(subscribe, () => currentFont, () => 'crimson-pro' as FontName);

    const setFont = useCallback((name: FontName) => {
        currentFont = name;
        localStorage.setItem(STORAGE_KEY, name);
        applyFont(name);
        notify();
    }, []);

    return { font, setFont, fonts: FONTS };
}
