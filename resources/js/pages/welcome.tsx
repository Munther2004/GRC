import { Head } from '@inertiajs/react';
import {
    ActivitySquare,
    ArrowRight,
    BarChart3,
    BookOpen,
    Building2,
    CheckCircle2,
    ClipboardList,
    Compass,
    FileSearch,
    FolderOpen,
    LayoutDashboard,
    Menu,
    Moon,
    Scale,
    Shield,
    ShieldCheck,
    Sparkles,
    Sun,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useAppearance } from '@/hooks/use-appearance';

/* ────────────────────────────────────────────────────────────────────────────
   Hooks & helpers
   ────────────────────────────────────────────────────────────────────────── */

function useReveal<T extends HTMLElement>(threshold = 0.18) {
    const ref = useRef<T | null>(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const io = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && setShown(true),
            { threshold },
        );
        io.observe(ref.current);
        return () => io.disconnect();
    }, [threshold]);
    return { ref, shown };
}

function useCountUp(target: number, durationMs: number, start: boolean) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!start) return;
        let raf = 0;
        const t0 = performance.now();
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / durationMs);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(target * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, durationMs, start]);
    return value;
}

function useMousePosition() {
    const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, []);
    return pos;
}

function usePointer(ref: React.RefObject<HTMLElement | null>) {
    const [p, setP] = useState({ x: 0, y: 0, active: false });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            setP({ x, y, active: true });
        };
        const onLeave = () => setP({ x: 0, y: 0, active: false });
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
        };
    }, [ref]);
    return p;
}

/* ────────────────────────────────────────────────────────────────────────────
   Theme palette — scoped to the landing page wrapper.
   Light tokens follow design.md (canvas / ink / deep-green / soft-stone).
   Dark tokens follow the project's existing forest palette.
   ────────────────────────────────────────────────────────────────────────── */

const LIGHT_VARS: Record<string, string> = {
    '--c-bg':           '#ffffff',
    '--c-bg-soft':      '#fbfbfa',
    '--c-fg':           '#17171c',
    '--c-ink':          '#212121',
    '--c-muted':        '#616161',
    '--c-slate':        '#75758a',
    '--c-hair':         '#d9d9dd',
    '--c-border':       '#e5e7eb',
    '--c-card':         '#ffffff',
    '--c-stone':        '#eeece7',
    '--c-pale-green':   '#edfce9',
    '--c-pale-blue':    '#f1f5ff',
    '--c-deep-green':   '#003c33',
    '--c-deep-green-2': '#072a25',
    '--c-accent':       '#003c33',
    '--c-on-dark':      '#ffffff',
    '--c-primary':      '#17171c',
    '--c-on-primary':   '#ffffff',
    '--c-blue':         '#1863dc',
    '--c-coral':        '#ff7759',
    '--c-mint':         '#b0e4cc',
    '--c-shadow':       '0 24px 60px -28px rgba(15, 23, 42, 0.28), 0 8px 22px -10px rgba(15, 23, 42, 0.12)',
    '--c-shadow-soft':  '0 10px 30px -16px rgba(15, 23, 42, 0.18)',
    '--c-mesh-1':       'radial-gradient(60% 60% at 18% 18%, rgba(0,60,51,0.10), transparent 70%)',
    '--c-mesh-2':       'radial-gradient(50% 50% at 82% 6%, rgba(24,99,220,0.08), transparent 75%)',
    '--c-mesh-3':       'radial-gradient(45% 45% at 88% 78%, rgba(255,119,89,0.10), transparent 78%)',
    '--c-grid':         'rgba(20, 24, 32, 0.06)',
    '--c-glass':        'rgba(255, 255, 255, 0.72)',
    '--c-glass-border': 'rgba(20, 24, 32, 0.08)',
};

const DARK_VARS: Record<string, string> = {
    '--c-bg':           '#06100e',
    '--c-bg-soft':      '#091413',
    '--c-fg':           '#e6f3ec',
    '--c-ink':          '#e6f3ec',
    '--c-muted':        '#8fb6a4',
    '--c-slate':        '#7c9c8d',
    '--c-hair':         '#1d3a31',
    '--c-border':       '#1e3a31',
    '--c-card':         '#0c1c19',
    '--c-stone':        '#0e2520',
    '--c-pale-green':   '#0c1f1b',
    '--c-pale-blue':    '#0c1620',
    '--c-deep-green':   '#063a31',
    '--c-deep-green-2': '#072a25',
    '--c-accent':       '#7fd1ad',
    '--c-on-dark':      '#e6f3ec',
    '--c-primary':      '#b0e4cc',
    '--c-on-primary':   '#06100e',
    '--c-blue':         '#7aa9e6',
    '--c-coral':        '#ff957c',
    '--c-mint':         '#b0e4cc',
    '--c-shadow':       '0 28px 64px -28px rgba(0,0,0,0.85), 0 12px 28px -14px rgba(0,0,0,0.55)',
    '--c-shadow-soft':  '0 12px 36px -18px rgba(0,0,0,0.55)',
    '--c-mesh-1':       'radial-gradient(60% 60% at 18% 18%, rgba(64,138,113,0.22), transparent 70%)',
    '--c-mesh-2':       'radial-gradient(50% 50% at 82% 6%, rgba(122,169,230,0.10), transparent 75%)',
    '--c-mesh-3':       'radial-gradient(45% 45% at 88% 78%, rgba(176,228,204,0.10), transparent 78%)',
    '--c-grid':         'rgba(176, 228, 204, 0.06)',
    '--c-glass':        'rgba(8, 18, 16, 0.72)',
    '--c-glass-border': 'rgba(176, 228, 204, 0.10)',
};

/* ────────────────────────────────────────────────────────────────────────────
   Theme toggle (uses existing useAppearance — localStorage + system preference)
   ────────────────────────────────────────────────────────────────────────── */

function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const next = isDark ? 'light' : 'dark';
    return (
        <button
            type="button"
            onClick={() => updateAppearance(next)}
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium transition-all"
            style={{
                color: 'var(--c-fg)',
                background: 'var(--c-glass)',
                border: '1px solid var(--c-glass-border)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: 'var(--c-shadow-soft)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <span
                className="relative inline-flex h-5 w-9 items-center rounded-full"
                style={{
                    background: isDark ? 'rgba(176,228,204,0.25)' : 'rgba(20,24,32,0.10)',
                    border: '1px solid var(--c-border)',
                }}
            >
                <span
                    className="absolute top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full transition-all"
                    style={{
                        left: isDark ? '18px' : '2px',
                        background: 'var(--c-primary)',
                        color: 'var(--c-on-primary)',
                    }}
                >
                    {isDark ? <Moon className="h-2.5 w-2.5" /> : <Sun className="h-2.5 w-2.5" />}
                </span>
            </span>
            {!compact && <span style={{ color: 'var(--c-muted)' }}>{isDark ? 'Dark' : 'Light'}</span>}
        </button>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Opening Seal — heraldic SVG that draws itself, then dissolves (preserved)
   ────────────────────────────────────────────────────────────────────────── */

function OpeningSeal({ onDone }: { onDone: () => void }) {
    const [phase, setPhase] = useState<'drawing' | 'breaking' | 'gone'>('drawing');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('breaking'), 1900);
        const t2 = setTimeout(() => {
            setPhase('gone');
            onDone();
        }, 2800);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [onDone]);

    if (phase === 'gone') return null;

    const breaking = phase === 'breaking';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
                background: breaking ? 'transparent' : '#000',
                transition: 'background 700ms cubic-bezier(.7,0,.3,1)',
                pointerEvents: breaking ? 'none' : 'auto',
            }}
            aria-hidden
        >
            {!breaking && (
                <button
                    onClick={() => {
                        setPhase('breaking');
                        setTimeout(() => {
                            setPhase('gone');
                            onDone();
                        }, 700);
                    }}
                    className="absolute top-6 right-6 text-[9px] uppercase tracking-[0.3em] opacity-50 transition-opacity hover:opacity-100"
                    style={{ color: '#7ABFA8' }}
                >
                    Skip ▸
                </button>
            )}

            <div
                className="relative"
                style={{
                    transform: breaking ? 'scale(2.4) rotate(-8deg)' : 'scale(1)',
                    opacity: breaking ? 0 : 1,
                    transition:
                        'transform 900ms cubic-bezier(.6,0,.3,1), opacity 900ms ease-out',
                    filter: breaking ? 'blur(2px)' : 'none',
                }}
            >
                <svg width="320" height="320" viewBox="-160 -160 320 320" style={{ overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="seal-glow" cx="0" cy="0" r="0.6">
                            <stop offset="0%" stopColor="#408A71" stopOpacity="0.7" />
                            <stop offset="60%" stopColor="#408A71" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#408A71" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    <circle r="120" fill="url(#seal-glow)" style={{ animation: 'seal-pulse 1.6s ease-in-out infinite' }} />
                    <circle
                        r="135"
                        fill="none"
                        stroke="#408A71"
                        strokeWidth="0.5"
                        strokeDasharray="1 4"
                        style={{ animation: 'seal-spin 18s linear infinite' }}
                    />
                    <circle
                        r="110"
                        fill="none"
                        stroke="#408A71"
                        strokeWidth="1.2"
                        strokeDasharray="691"
                        strokeDashoffset="691"
                        style={{ animation: 'seal-draw 1.0s 0.05s cubic-bezier(.7,0,.3,1) forwards' }}
                    />
                    <circle
                        r="92"
                        fill="none"
                        stroke="#7ABFA8"
                        strokeWidth="0.5"
                        strokeDasharray="578"
                        strokeDashoffset="578"
                        style={{ animation: 'seal-draw 0.9s 0.25s cubic-bezier(.7,0,.3,1) forwards' }}
                    />
                    {Array.from({ length: 8 }).map((_, i) => {
                        const a = (i / 8) * Math.PI * 2;
                        const x1 = Math.cos(a) * 92, y1 = Math.sin(a) * 92;
                        const x2 = Math.cos(a) * 110, y2 = Math.sin(a) * 110;
                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#408A71"
                                strokeWidth="1"
                                strokeDasharray="20"
                                strokeDashoffset="20"
                                style={{ animation: `seal-draw 0.4s ${0.5 + i * 0.04}s ease-out forwards` }}
                            />
                        );
                    })}
                    <path
                        d="M 0 -76 L 56 -50 L 56 18 Q 56 56 0 76 Q -56 56 -56 18 L -56 -50 Z"
                        fill="none"
                        stroke="#408A71"
                        strokeWidth="1.2"
                        strokeDasharray="380"
                        strokeDashoffset="380"
                        style={{ animation: 'seal-draw 0.9s 0.55s cubic-bezier(.7,0,.3,1) forwards' }}
                    />
                    <line
                        x1="-56" y1="-50" x2="56" y2="76"
                        stroke="#408A71" strokeWidth="0.4" opacity="0.5"
                        strokeDasharray="200" strokeDashoffset="200"
                        style={{ animation: 'seal-draw 0.5s 1.05s ease-out forwards' }}
                    />
                    <line
                        x1="56" y1="-50" x2="-56" y2="76"
                        stroke="#408A71" strokeWidth="0.4" opacity="0.5"
                        strokeDasharray="200" strokeDashoffset="200"
                        style={{ animation: 'seal-draw 0.5s 1.05s ease-out forwards' }}
                    />
                    <g style={{ opacity: 0, animation: 'seal-fade 0.5s 1.25s ease-out forwards' }}>
                        <text
                            x="0" y="14" textAnchor="middle"
                            fill="#B0E4CC" fontSize="46"
                            fontFamily="Cinzel, Trajan Pro, serif"
                            style={{ letterSpacing: '-0.05em' }}
                        >
                            ✶
                        </text>
                    </g>
                    <g style={{ opacity: 0, animation: 'seal-fade 0.6s 1.35s ease-out forwards' }}>
                        <defs>
                            <path id="motto-arc" d="M -125,0 a 125,125 0 1,1 250,0 a 125,125 0 1,1 -250,0" fill="none" />
                        </defs>
                        <text fill="#7ABFA8" fontSize="9" fontFamily="Cinzel, serif" letterSpacing="6">
                            <textPath href="#motto-arc" startOffset="0">
                                · FIDES · RATIO · ORDO · LEX · DISCIPLINA · CUSTODIA ·
                            </textPath>
                        </text>
                    </g>
                </svg>

                <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-[10px] uppercase"
                    style={{
                        top: 'calc(100% + 32px)',
                        letterSpacing: '0.6em',
                        color: '#7ABFA8',
                        opacity: 0,
                        animation: 'seal-fade 0.6s 1.55s ease-out forwards',
                    }}
                >
                    The Charter Opens
                </div>
            </div>

            <style>{`
                @keyframes seal-draw  { to { stroke-dashoffset: 0; } }
                @keyframes seal-fade  { to { opacity: 1; } }
                @keyframes seal-spin  { to { transform: rotate(360deg); } }
                @keyframes seal-pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.85 } }
            `}</style>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Compliance Orrery — animated rotating rings of frameworks (preserved)
   ────────────────────────────────────────────────────────────────────────── */

const ORRERY_FRAMEWORKS = [
    { code: 'ISO 27001', orbit: 0, speed: 36, size: 7 },
    { code: 'NIST',      orbit: 1, speed: -42, size: 6 },
    { code: 'OWASP',     orbit: 2, speed: 30, size: 6 },
    { code: 'CIS',       orbit: 3, speed: -54, size: 5 },
    { code: 'SOC 2',     orbit: 0, speed: 36, size: 5, phase: 180 },
    { code: 'PCI DSS',   orbit: 2, speed: 30, size: 5, phase: 200 },
    { code: 'GDPR',      orbit: 1, speed: -42, size: 5, phase: 90 },
    { code: 'HIPAA',     orbit: 3, speed: -54, size: 4, phase: 240 },
];

function ComplianceOrrery() {
    const [t, setT] = useState(0);
    const mouse = useMousePosition();
    useEffect(() => {
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            setT((now - t0) / 1000);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const radii = [80, 120, 162, 208];
    const tilt = (mouse.x - 0.5) * 18;
    const tiltY = (mouse.y - 0.5) * 12;

    return (
        <div className="relative mx-auto h-[420px] w-full max-w-[460px]">
            <div
                className="absolute inset-0"
                style={{
                    transform: `perspective(900px) rotateY(${tilt}deg) rotateX(${-tiltY}deg)`,
                    transition: 'transform 300ms ease-out',
                }}
            >
                <svg width="100%" height="100%" viewBox="-240 -240 480 480" style={{ overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="orrery-core" cx="0" cy="0" r="0.5">
                            <stop offset="0%" stopColor="#B0E4CC" stopOpacity="1" />
                            <stop offset="40%" stopColor="#408A71" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#408A71" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="orrery-aura" cx="0" cy="0" r="0.7">
                            <stop offset="0%" stopColor="#408A71" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#408A71" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    <circle r="220" fill="url(#orrery-aura)" />

                    {radii.map((r, i) => (
                        <g key={i}>
                            <circle
                                r={r} fill="none"
                                stroke="var(--c-orrery-ring)" strokeWidth="0.6"
                                strokeDasharray={i % 2 ? '2 6' : '1 3'}
                                opacity="0.7"
                            />
                            <circle
                                r={r} fill="none"
                                stroke="#408A71" strokeWidth="0.4"
                                strokeDasharray={`${r * 0.3} ${r * 6.0}`}
                                style={{
                                    transformOrigin: '0 0',
                                    transform: `rotate(${(t * (i % 2 ? -8 : 12)) % 360}deg)`,
                                }}
                            />
                        </g>
                    ))}

                    <g style={{ transformOrigin: '0 0', transform: `rotate(${(t * 4) % 360}deg)` }}>
                        {[0, 90, 180, 270].map((a) => {
                            const x = Math.cos((a * Math.PI) / 180) * 232;
                            const y = Math.sin((a * Math.PI) / 180) * 232;
                            return (
                                <text
                                    key={a} x={x} y={y + 3} textAnchor="middle"
                                    fontSize="10" fill="#7ABFA8"
                                    fontFamily="Cinzel, serif" letterSpacing="3"
                                >
                                    ✶
                                </text>
                            );
                        })}
                    </g>

                    <circle r="50" fill="url(#orrery-core)" />
                    <circle r="22" fill="none" stroke="#B0E4CC" strokeWidth="0.5" opacity="0.6" />
                    <text
                        x="0" y="6" textAnchor="middle"
                        fontSize="14" fontFamily="Cinzel, serif" fill="var(--c-fg)"
                        letterSpacing="4" style={{ fontWeight: 600 }}
                    >
                        GRC
                    </text>

                    {ORRERY_FRAMEWORKS.map((f, i) => {
                        const r = radii[f.orbit];
                        const speed = f.speed;
                        const phase = ((f.phase ?? 0) * Math.PI) / 180;
                        const a = (t * speed * Math.PI) / 180 + phase;
                        const x = Math.cos(a) * r;
                        const y = Math.sin(a) * r;
                        return (
                            <g key={i} style={{ transform: `translate(${x}px, ${y}px)` }}>
                                <circle r={f.size + 4} fill="#408A71" opacity="0.18" />
                                <circle r={f.size} fill="#0D1F1C" stroke="#408A71" strokeWidth="1" />
                                <circle r={f.size - 2.5} fill="#B0E4CC" opacity="0.85" />
                                <text
                                    x={f.size + 8} y="3"
                                    fontSize="9" fontFamily="Cinzel, serif"
                                    fill="#7ABFA8" letterSpacing="2"
                                >
                                    {f.code}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {[
                { top: 0, left: 0, r: 0 },
                { top: 0, right: 0, r: 90 },
                { bottom: 0, right: 0, r: 180 },
                { bottom: 0, left: 0, r: 270 },
            ].map((c, i) => (
                <span
                    key={i}
                    className="pointer-events-none absolute h-6 w-6"
                    style={{
                        ...c,
                        borderLeft: '1px solid var(--c-accent)',
                        borderTop: '1px solid var(--c-accent)',
                        opacity: 0.45,
                        transform: `rotate(${c.r}deg)`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Motto marquee — preserved endless serif strip
   ────────────────────────────────────────────────────────────────────────── */

function MottoMarquee() {
    const phrases = [
        'GOVERN WITH INTENT',
        'MEASURE EVERY RISK',
        'AUDIT WITH CLARITY',
        'COMPLY WITH PURPOSE',
        'EVIDENCE THE TRUTH',
        'TRUST · BUT VERIFY',
    ];
    const items = [...phrases, ...phrases];
    return (
        <div
            className="relative overflow-hidden py-5"
            style={{
                borderTop: '1px solid var(--c-border)',
                borderBottom: '1px solid var(--c-border)',
                background: 'color-mix(in srgb, var(--c-card) 60%, transparent)',
            }}
        >
            <div
                className="flex w-max gap-12 whitespace-nowrap"
                style={{ animation: 'welcome-marquee 38s linear infinite' }}
            >
                {items.map((p, i) => (
                    <span
                        key={i}
                        className="flex items-center gap-12 text-[11px] uppercase"
                        style={{ color: 'var(--c-muted)', letterSpacing: '0.5em' }}
                    >
                        {p}
                        <span style={{ color: 'var(--c-accent)' }}>✶</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Hero word-reveal (preserved)
   ────────────────────────────────────────────────────────────────────────── */

function HeroTitle({ start }: { start: boolean }) {
    const lines = useMemo(
        () => [
            ['Risk', 'is', 'not'],
            ['eliminated.'],
            ['It', 'is', 'governed.'],
        ],
        [],
    );
    let idx = 0;
    return (
        <h1
            className="text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-[88px] lg:leading-[0.96] lg:tracking-[-0.03em]"
            style={{ color: 'var(--c-fg)', fontWeight: 500 }}
        >
            {lines.map((line, li) => (
                <span key={li} className="block">
                    {line.map((w, wi) => {
                        const i = idx++;
                        const accent = w === 'governed.';
                        return (
                            <span
                                key={wi}
                                className="inline-block"
                                style={{
                                    marginRight: '0.22em',
                                    color: accent ? 'var(--c-accent)' : 'inherit',
                                    fontStyle: accent ? 'italic' : 'normal',
                                    opacity: start ? 1 : 0,
                                    transform: start ? 'translateY(0)' : 'translateY(40px)',
                                    transition: `opacity .9s ${i * 90}ms cubic-bezier(.2,.7,.2,1), transform .9s ${i * 90}ms cubic-bezier(.2,.7,.2,1)`,
                                }}
                            >
                                {w}
                            </span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   3D dashboard mock — perspective tilt on pointer
   ────────────────────────────────────────────────────────────────────────── */

function HeroDashboardMock({ start }: { start: boolean }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const p = usePointer(ref);
    const tiltX = (-p.y * 7).toFixed(2);
    const tiltY = (p.x * 9).toFixed(2);

    return (
        <div
            ref={ref}
            className="relative h-[440px] w-full sm:h-[500px]"
            style={{
                perspective: '1400px',
                opacity: start ? 1 : 0,
                transform: start ? 'scale(1)' : 'scale(0.94)',
                transition: 'opacity 1.1s 0.5s cubic-bezier(.2,.7,.2,1), transform 1.1s 0.5s cubic-bezier(.2,.7,.2,1)',
            }}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -inset-12"
                style={{
                    background:
                        'radial-gradient(40% 40% at 30% 30%, color-mix(in srgb, var(--c-accent) 20%, transparent), transparent 70%),' +
                        'radial-gradient(40% 40% at 80% 70%, color-mix(in srgb, var(--c-blue) 14%, transparent), transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
            <div
                className="relative h-full w-full"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(-2deg)`,
                    transition: 'transform 240ms cubic-bezier(.2,.7,.2,1)',
                }}
            >
                {/* primary panel — risk register */}
                <div
                    className="absolute right-0 top-2 w-[90%] overflow-hidden rounded-2xl"
                    style={{
                        background: 'var(--c-card)',
                        border: '1px solid var(--c-border)',
                        boxShadow: 'var(--c-shadow)',
                        transform: 'translateZ(40px)',
                    }}
                >
                    <div
                        className="flex items-center justify-between px-5 py-3"
                        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-soft)' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: '#ff5f56' }} />
                            <span className="h-2 w-2 rounded-full" style={{ background: '#ffbd2e' }} />
                            <span className="h-2 w-2 rounded-full" style={{ background: '#27c93f' }} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--c-muted)' }}>
                            Risk Register
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>
                            grc.app/risks
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-5">
                        {[
                            { label: 'Open',     value: '128', tone: 'var(--c-accent)' },
                            { label: 'Critical', value: '12',  tone: 'var(--c-coral)' },
                            { label: 'Closed',   value: '341', tone: 'var(--c-blue)' },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="rounded-lg p-3"
                                style={{ background: 'var(--c-bg-soft)', border: '1px solid var(--c-border)' }}
                            >
                                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--c-muted)' }}>
                                    {s.label}
                                </p>
                                <p className="mt-1 text-2xl" style={{ color: s.tone, fontWeight: 500 }}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="px-5 pb-5">
                        {[
                            { id: 'R-128', name: 'Unencrypted backup snapshots',  band: 'Critical', score: 20, hue: 'var(--c-coral)' },
                            { id: 'R-114', name: 'Privileged access drift',       band: 'High',     score: 15, hue: '#d97706' },
                            { id: 'R-102', name: 'Vendor TLS expiry',             band: 'Medium',   score: 9,  hue: 'var(--c-blue)' },
                            { id: 'R-091', name: 'Stale evidence on AC controls', band: 'Low',      score: 4,  hue: 'var(--c-accent)' },
                        ].map((r) => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between gap-4 py-2"
                                style={{ borderTop: '1px solid var(--c-border)' }}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                                        style={{ background: `color-mix(in srgb, ${r.hue} 14%, transparent)`, color: r.hue }}
                                    >
                                        {r.band}
                                    </span>
                                    <span className="truncate text-sm" style={{ color: 'var(--c-fg)' }}>
                                        {r.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-1 w-20 overflow-hidden rounded-full"
                                        style={{ background: 'var(--c-border)' }}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(r.score / 25) * 100}%`,
                                                background: r.hue,
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] tabular-nums" style={{ color: 'var(--c-muted)' }}>
                                        {r.id}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* secondary card — compliance posture */}
                <div
                    className="absolute -bottom-2 -left-2 w-[58%] overflow-hidden rounded-2xl"
                    style={{
                        background: 'var(--c-deep-green)',
                        color: 'var(--c-on-dark)',
                        boxShadow: 'var(--c-shadow)',
                        transform: 'translateZ(80px) rotate(-3deg)',
                    }}
                >
                    <div className="px-5 py-4">
                        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ opacity: 0.7 }}>
                            Compliance Posture
                        </p>
                        <p className="mt-1 text-4xl" style={{ fontWeight: 500 }}>
                            94.2<span style={{ opacity: 0.6 }}>%</span>
                        </p>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }}>
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: '94%',
                                    background: 'var(--c-mint)',
                                    animation: 'welcome-fill 1.4s cubic-bezier(.2,.7,.2,1) 0.4s backwards',
                                }}
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]" style={{ opacity: 0.85 }}>
                            <span>ISO 27001</span>
                            <span>NIST</span>
                            <span>OWASP</span>
                            <span>CIS</span>
                        </div>
                    </div>
                </div>

                {/* floating chip — AI verdict */}
                <div
                    className="absolute -right-3 bottom-6 flex items-center gap-2 rounded-full px-3 py-2 text-[11px]"
                    style={{
                        background: 'var(--c-card)',
                        border: '1px solid var(--c-border)',
                        boxShadow: 'var(--c-shadow-soft)',
                        transform: 'translateZ(120px) rotate(2deg)',
                        color: 'var(--c-fg)',
                    }}
                >
                    <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: 'var(--c-pale-blue)', color: 'var(--c-blue)' }}
                    >
                        <Sparkles className="h-3 w-3" />
                    </span>
                    AI evidence verdict · <strong style={{ color: 'var(--c-accent)' }}>Adequate</strong>
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Living metric — count-up (preserved)
   ────────────────────────────────────────────────────────────────────────── */

function LivingMetric({
    value,
    suffix,
    label,
    kicker,
    delay = 0,
}: {
    value: number;
    suffix?: string;
    label: string;
    kicker: string;
    delay?: number;
}) {
    const { ref, shown } = useReveal<HTMLDivElement>(0.4);
    const v = useCountUp(value, 1600, shown);
    const isInteger = Number.isInteger(value);
    const display = isInteger
        ? Math.round(v).toLocaleString()
        : value >= 100
          ? Math.round(v).toLocaleString()
          : v.toFixed(1);
    return (
        <div
            ref={ref}
            className="px-6 py-10"
            style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity .8s ${delay}ms ease, transform .8s ${delay}ms cubic-bezier(.2,.7,.2,1)`,
            }}
        >
            <p className="mb-3 text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--c-muted)' }}>
                {kicker}
            </p>
            <p
                className="mb-2 text-5xl leading-none lg:text-6xl"
                style={{ color: 'var(--c-fg)', fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: '-0.02em' }}
            >
                {display}
                {suffix && <span style={{ color: 'var(--c-muted)' }}>{suffix}</span>}
            </p>
            <p className="text-sm italic" style={{ color: 'var(--c-muted)' }}>
                {label}
            </p>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Tenets — preserved with hover sweep
   ────────────────────────────────────────────────────────────────────────── */

const TENETS = [
    { icon: Compass,  title: 'Governance', body: 'A single source of authority for every policy, every framework, every owner.' },
    { icon: Scale,    title: 'Risk',       body: 'Likelihood and impact, scored on a common scale, treated on a common timeline.' },
    { icon: BookOpen, title: 'Compliance', body: 'Continuous evidence, mapped to controls, mapped to obligations, mapped to outcomes.' },
];

function Tenets() {
    const { ref, shown } = useReveal<HTMLDivElement>(0.2);
    return (
        <section ref={ref} className="mx-auto max-w-7xl px-6 py-24">
            <div
                className="mb-14 max-w-2xl"
                style={{
                    opacity: shown ? 1 : 0,
                    transform: shown ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all .8s ease',
                }}
            >
                <p className="mb-4 text-[11px] uppercase tracking-[0.4em]" style={{ color: 'var(--c-accent)' }}>
                    The Three Tenets
                </p>
                <h2
                    className="text-4xl tracking-[-0.02em] lg:text-5xl"
                    style={{ color: 'var(--c-fg)', fontWeight: 500, lineHeight: 1.05 }}
                >
                    One discipline,{' '}
                    <span style={{ color: 'var(--c-accent)', fontStyle: 'italic' }}>three orders.</span>
                </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl" style={{ background: 'var(--c-border)', gridTemplateColumns: 'repeat(3, 1fr)', boxShadow: 'var(--c-shadow-soft)' }}>
                {TENETS.map((t, i) => {
                    const Icon = t.icon;
                    return (
                        <div
                            key={t.title}
                            className="group relative flex flex-col items-start p-10"
                            style={{
                                background: 'var(--c-card)',
                                opacity: shown ? 1 : 0,
                                transform: shown ? 'translateY(0)' : 'translateY(30px)',
                                transition: `opacity .9s ${200 + i * 150}ms ease, transform .9s ${200 + i * 150}ms cubic-bezier(.2,.7,.2,1)`,
                            }}
                        >
                            <div
                                className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl"
                                style={{
                                    background: 'var(--c-pale-green)',
                                    color: 'var(--c-accent)',
                                    border: '1px solid color-mix(in srgb, var(--c-accent) 20%, transparent)',
                                }}
                            >
                                <Icon className="h-5 w-5" strokeWidth={1.5} />
                            </div>

                            <h3 className="mb-3 text-2xl" style={{ color: 'var(--c-fg)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                                {t.title}
                            </h3>
                            <p className="text-base leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                                {t.body}
                            </p>

                            {/* hover sweep — preserved */}
                            <span
                                className="pointer-events-none absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                                style={{ background: 'var(--c-accent)' }}
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Feature card — 3D tilt + reveal
   ────────────────────────────────────────────────────────────────────────── */

type Feature = {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    title: string;
    body: string;
    tag: string;
};

function FeatureCard({ f, i }: { f: Feature; i: number }) {
    const { ref, shown } = useReveal<HTMLDivElement>(0.18);
    const tiltRef = useRef<HTMLDivElement | null>(null);
    const p = usePointer(tiltRef);
    const Icon = f.icon;
    const tiltX = p.active ? (-p.y * 7).toFixed(2) : '0';
    const tiltY = p.active ? (p.x * 9).toFixed(2) : '0';
    return (
        <div
            ref={ref}
            className="group h-full"
            style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity .8s ${i * 60}ms ease, transform .9s ${i * 60}ms cubic-bezier(.2,.7,.2,1)`,
                perspective: '1100px',
            }}
        >
            <div
                ref={tiltRef}
                className="relative flex h-full flex-col overflow-hidden rounded-2xl p-7"
                style={{
                    background: 'var(--c-card)',
                    border: '1px solid var(--c-border)',
                    boxShadow: p.active ? 'var(--c-shadow)' : 'var(--c-shadow-soft)',
                    transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 220ms cubic-bezier(.2,.7,.2,1), box-shadow 220ms ease',
                }}
            >
                {/* sheen on hover */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(220px circle at ${(p.x + 0.5) * 100}% ${(p.y + 0.5) * 100}%, color-mix(in srgb, var(--c-accent) 9%, transparent), transparent 70%)`,
                    }}
                />

                <div className="flex items-start justify-between" style={{ transform: 'translateZ(40px)' }}>
                    <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{
                            background: 'var(--c-pale-green)',
                            color: 'var(--c-accent)',
                            border: '1px solid color-mix(in srgb, var(--c-accent) 18%, transparent)',
                        }}
                    >
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span
                        className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: 'var(--c-muted)', border: '1px solid var(--c-border)' }}
                    >
                        {f.tag}
                    </span>
                </div>

                <h3
                    className="mt-6 text-xl"
                    style={{ color: 'var(--c-fg)', fontWeight: 500, letterSpacing: '-0.01em', transform: 'translateZ(30px)' }}
                >
                    {f.title}
                </h3>
                <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--c-muted)', transform: 'translateZ(20px)' }}
                >
                    {f.body}
                </p>

                <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-px left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                    style={{ background: 'var(--c-accent)' }}
                />
            </div>
        </div>
    );
}

const FEATURES: Feature[] = [
    {
        icon: BarChart3,
        title: 'Risk Register',
        body: 'ISO 27005 likelihood × impact matrix. Score every threat, link it to controls, and trace each treatment from acceptance to closure.',
        tag: 'Core',
    },
    {
        icon: ClipboardList,
        title: 'Compliance Assessments',
        body: 'Self-assessments across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Benchmarks — generated from one library, scored on one yardstick.',
        tag: 'Frameworks',
    },
    {
        icon: FolderOpen,
        title: 'Evidence Repository',
        body: 'Versioned uploads bound to controls and assessment items. Auditors see the chain, reviewers see the queue, owners see what is missing.',
        tag: 'Custody',
    },
    {
        icon: ShieldCheck,
        title: 'Controls Hub',
        body: '443 controls, four frameworks, one library. Status workflows, change requests, and tamper-evident histories on every clause.',
        tag: 'Library',
    },
    {
        icon: FileSearch,
        title: 'Gap Analysis',
        body: 'Surface every non-compliant and partially compliant control in a single ledger — ranked by exposure, framework, and time open.',
        tag: 'Insight',
    },
    {
        icon: Sparkles,
        title: 'AI Assistance',
        body: 'Claude-powered evidence review, threat suggestion, gap remediation, and security-config analysis — verdicts you can audit, not just trust.',
        tag: 'Anthropic',
    },
    {
        icon: LayoutDashboard,
        title: 'Dashboards & Reports',
        body: 'Live KRIs, executive summaries, exportable reports. Daily snapshots make trend lines reproducible against any past date.',
        tag: 'Telemetry',
    },
    {
        icon: Users,
        title: 'Role-Based Access',
        body: 'Super Admin, Admin, Auditor, and User. Tenant-scoped at the controller, never just the UI — separation of duty by construction.',
        tag: 'RBAC',
    },
    {
        icon: Building2,
        title: 'Corporation Onboarding',
        body: 'Multi-tenant by design. Self-serve registration, super-admin approval, and credentialed manager handoff — every row carries a corporation.',
        tag: 'Tenant',
    },
];

/* ────────────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────────── */

export default function Welcome() {
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const palette = isDark ? DARK_VARS : LIGHT_VARS;

    const [sealDone, setSealDone] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ESC closes mobile nav.
    useEffect(() => {
        if (!mobileNavOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileNavOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [mobileNavOpen]);

    return (
        <>
            <Head title="GRC System — Risk is not eliminated. It is governed." />

            <OpeningSeal onDone={() => setSealDone(true)} />

            <div
                className="welcome-root relative min-h-screen overflow-x-hidden antialiased"
                style={{
                    ...(palette as React.CSSProperties),
                    ['--c-orrery-ring' as string]: isDark ? '#285A48' : '#cfe6dc',
                    background: 'var(--c-bg)',
                    color: 'var(--c-fg)',
                    fontFamily: "'Inter', 'Unica77 Cohere Web', system-ui, sans-serif",
                }}
            >
                {/* Background fixtures: gradient mesh + subtle grid */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{ background: 'var(--c-mesh-1), var(--c-mesh-2), var(--c-mesh-3)' }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(var(--c-grid) 1px, transparent 1px),' +
                            'linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%)',
                    }}
                />

                {/* ─── Nav ─── */}
                <header
                    className="sticky top-0 z-30"
                    style={{
                        background: 'var(--c-glass)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        borderBottom: '1px solid var(--c-glass-border)',
                    }}
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <a href="/" className="flex items-center gap-3">
                            <AppLogoIcon className="size-14" />
                            <span
                                className="text-[12px] uppercase"
                                style={{ color: 'var(--c-fg)', letterSpacing: '0.28em', fontWeight: 600 }}
                            >
                                GRC<span style={{ color: 'var(--c-muted)', fontWeight: 400 }}> · Charter</span>
                            </span>
                        </a>

                        <nav className="hidden items-center gap-8 md:flex">
                            {[
                                { l: 'Tenets',     h: '#tenets' },
                                { l: 'Platform',   h: '#features' },
                                { l: 'Frameworks', h: '#frameworks' },
                                { l: 'About',      h: '/about' },
                            ].map((n) => (
                                <a
                                    key={n.l}
                                    href={n.h}
                                    className="text-sm transition-colors"
                                    style={{ color: 'var(--c-muted)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-fg)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-muted)')}
                                >
                                    {n.l}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <ThemeToggle compact />
                            <a
                                href="/login"
                                className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-[12px] transition-colors"
                                style={{ color: 'var(--c-fg)', border: '1px solid var(--c-border)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-fg)')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
                            >
                                Log in
                            </a>
                            <a
                                href="/corporation/register"
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] transition-all"
                                style={{
                                    background: 'var(--c-primary)',
                                    color: 'var(--c-on-primary)',
                                    fontWeight: 500,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                            >
                                Get started
                                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                            </a>
                            {/* Mobile hamburger — only visible below md, mirrors admin shell pattern */}
                            <button
                                type="button"
                                aria-label="Open navigation"
                                aria-expanded={mobileNavOpen}
                                onClick={() => setMobileNavOpen(true)}
                                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full md:hidden"
                                style={{ color: 'var(--c-fg)', border: '1px solid var(--c-border)' }}
                            >
                                <Menu className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* ─── Mobile nav drawer ─── */}
                {mobileNavOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 md:hidden"
                            style={{
                                background: 'color-mix(in srgb, var(--c-fg) 40%, transparent)',
                                backdropFilter: 'blur(2px)',
                            }}
                            onClick={() => setMobileNavOpen(false)}
                            aria-hidden
                        />
                        <aside
                            role="dialog"
                            aria-modal="true"
                            aria-label="Site navigation"
                            className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col md:hidden"
                            style={{
                                background: 'var(--c-bg)',
                                borderLeft: '1px solid var(--c-border)',
                            }}
                        >
                            <div
                                className="flex h-16 shrink-0 items-center justify-between px-5"
                                style={{ borderBottom: '1px solid var(--c-border)' }}
                            >
                                <span
                                    className="text-[12px] uppercase"
                                    style={{ color: 'var(--c-fg)', letterSpacing: '0.28em', fontWeight: 600 }}
                                >
                                    Menu
                                </span>
                                <button
                                    type="button"
                                    aria-label="Close navigation"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                    style={{ color: 'var(--c-muted)' }}
                                >
                                    <X className="h-4 w-4" strokeWidth={1.8} />
                                </button>
                            </div>
                            <nav className="flex flex-1 min-h-0 flex-col gap-1 overflow-y-auto px-3 py-4">
                                {[
                                    { l: 'Tenets',     h: '#tenets' },
                                    { l: 'Platform',   h: '#features' },
                                    { l: 'Frameworks', h: '#frameworks' },
                                    { l: 'About',      h: '/about' },
                                ].map((n) => (
                                    <a
                                        key={n.l}
                                        href={n.h}
                                        onClick={() => setMobileNavOpen(false)}
                                        className="rounded-2xl px-3 py-3 text-sm transition-colors"
                                        style={{ color: 'var(--c-fg)' }}
                                    >
                                        {n.l}
                                    </a>
                                ))}
                            </nav>
                            <div className="shrink-0 border-t px-3 py-4" style={{ borderColor: 'var(--c-border)' }}>
                                <a
                                    href="/login"
                                    className="block w-full rounded-full px-4 py-2.5 text-center text-[12px] transition-colors"
                                    style={{ color: 'var(--c-fg)', border: '1px solid var(--c-border)' }}
                                >
                                    Log in
                                </a>
                            </div>
                        </aside>
                    </>
                )}

                {/* ─── Hero ─── */}
                <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12 lg:pb-24 lg:pt-20">
                    <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-6">
                            <div
                                className="mb-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
                                style={{
                                    background: 'var(--c-pale-green)',
                                    color: 'var(--c-accent)',
                                    border: '1px solid color-mix(in srgb, var(--c-accent) 18%, transparent)',
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(10px)',
                                    transition: 'all .7s ease',
                                }}
                            >
                                <span
                                    className="inline-block h-1.5 w-1.5 rounded-full"
                                    style={{ background: 'var(--c-accent)', animation: 'welcome-pulse 2s ease-in-out infinite' }}
                                />
                                Risk · Controls · Evidence — one ledger
                            </div>

                            <HeroTitle start={sealDone} />

                            <p
                                className="mt-7 max-w-xl text-lg sm:text-xl"
                                style={{
                                    color: 'var(--c-fg)',
                                    fontWeight: 500,
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.3,
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all .9s 0.85s cubic-bezier(.2,.7,.2,1)',
                                }}
                            >
                                An AI-Powered Governance, Risk &amp; Compliance Management System
                            </p>

                            <p
                                className="mt-5 max-w-xl text-base leading-relaxed"
                                style={{
                                    color: 'var(--c-muted)',
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all .9s 1.0s cubic-bezier(.2,.7,.2,1)',
                                }}
                            >
                                A scholarly platform for governance, risk, and compliance — where ISO&nbsp;27001, NIST,
                                OWASP, and CIS converge into one disciplined ledger. Bind risks to controls, controls to
                                evidence, and evidence to outcomes.
                            </p>

                            <div
                                className="mt-9 flex flex-wrap items-center gap-4"
                                style={{
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all .9s 1.2s cubic-bezier(.2,.7,.2,1)',
                                }}
                            >
                                <a
                                    href="/corporation/register"
                                    className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition-all"
                                    style={{
                                        background: 'var(--c-primary)',
                                        color: 'var(--c-on-primary)',
                                        fontWeight: 500,
                                        boxShadow: 'var(--c-shadow)',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                                >
                                    Register your corporation
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
                                </a>

                                <a
                                    href="#tenets"
                                    className="group inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm transition-colors"
                                    style={{ color: 'var(--c-fg)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-accent)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-fg)')}
                                >
                                    Read the tenets
                                    <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
                                </a>
                            </div>

                            <div
                                className="mt-12 flex items-center gap-6 flex-wrap"
                                style={{
                                    opacity: sealDone ? 1 : 0,
                                    transition: 'all 1s 1.6s ease',
                                }}
                            >
                                <span
                                    className="text-[10px] uppercase tracking-[0.4em]"
                                    style={{ color: 'var(--c-muted)' }}
                                >
                                    Bound by
                                </span>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    {['ISO 27001', 'NIST 800-53', 'OWASP ASVS', 'CIS Benchmarks'].map((b) => (
                                        <span
                                            key={b}
                                            className="text-[11px] uppercase"
                                            style={{ color: 'var(--c-fg)', letterSpacing: '0.22em', opacity: 0.85 }}
                                        >
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <HeroDashboardMock start={sealDone} />
                        </div>
                    </div>

                    {/* scroll indicator (preserved) */}
                    <div
                        className="mt-16 flex flex-col items-center gap-2"
                        style={{
                            opacity: sealDone && scrollY < 40 ? 0.6 : 0,
                            transition: 'opacity .6s ease',
                        }}
                    >
                        <span
                            className="text-[9px] uppercase"
                            style={{ color: 'var(--c-muted)', letterSpacing: '0.4em' }}
                        >
                            Descend
                        </span>
                        <span
                            className="block h-10 w-px"
                            style={{
                                background: 'linear-gradient(to bottom, var(--c-accent), transparent)',
                                animation: 'welcome-scroll-line 2s ease-in-out infinite',
                            }}
                        />
                    </div>
                </section>

                {/* ─── Motto Marquee (preserved) ─── */}
                <MottoMarquee />

                {/* ─── Tenets ─── */}
                <div id="tenets">
                    <Tenets />
                </div>

                {/* ─── Frameworks Atlas — preserved orrery ─── */}
                <section
                    id="frameworks"
                    className="relative z-10 mx-auto max-w-7xl px-6 py-24"
                    style={{ borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }}
                >
                    <div className="grid items-center gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <p
                                className="mb-4 text-[11px] uppercase tracking-[0.4em]"
                                style={{ color: 'var(--c-accent)' }}
                            >
                                Frameworks Atlas
                            </p>
                            <h2
                                className="text-4xl tracking-[-0.02em] lg:text-5xl"
                                style={{ color: 'var(--c-fg)', fontWeight: 500, lineHeight: 1.05 }}
                            >
                                Five standards.{' '}
                                <span style={{ color: 'var(--c-accent)', fontStyle: 'italic' }}>One orbit.</span>
                            </h2>
                            <p className="mt-6 max-w-md text-lg" style={{ color: 'var(--c-muted)' }}>
                                ISO 27001, ISO 27005, NIST 800-53, OWASP ASVS, and CIS Benchmarks share
                                the platform's spine — one library, one yardstick, one ledger.
                            </p>
                            <div className="mt-8 flex items-center gap-3 text-xs" style={{ color: 'var(--c-muted)' }}>
                                <ActivitySquare className="h-4 w-4" style={{ color: 'var(--c-accent)' }} />
                                Move your cursor — the orbit responds
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <ComplianceOrrery />
                        </div>
                    </div>
                </section>

                {/* ─── Features ─── */}
                <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
                    <div className="mb-14 max-w-3xl">
                        <p className="mb-4 text-[11px] uppercase tracking-[0.4em]" style={{ color: 'var(--c-accent)' }}>
                            The Platform
                        </p>
                        <h2
                            className="text-4xl tracking-[-0.02em] sm:text-5xl lg:text-6xl"
                            style={{ color: 'var(--c-fg)', fontWeight: 500, lineHeight: 1.05 }}
                        >
                            Everything is a chapter,{' '}
                            <span style={{ color: 'var(--c-accent)', fontStyle: 'italic' }}>nothing is a feature.</span>
                        </h2>
                        <p className="mt-6 max-w-xl text-lg" style={{ color: 'var(--c-muted)' }}>
                            One discipline across nine surfaces. Every screen reads from the same control library, the
                            same risk ledger, and the same evidence chain.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f, i) => (
                            <FeatureCard key={f.title} f={f} i={i} />
                        ))}
                    </div>
                </section>

                {/* ─── Dark band — AI Assistance showcase ─── */}
                <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
                    <div
                        className="relative overflow-hidden rounded-[22px] p-8 sm:p-12 lg:p-16"
                        style={{
                            background: 'var(--c-deep-green)',
                            color: 'var(--c-on-dark)',
                            boxShadow: 'var(--c-shadow)',
                        }}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full"
                            style={{
                                background: 'radial-gradient(circle at 30% 30%, rgba(176,228,204,0.45), transparent 60%)',
                                filter: 'blur(20px)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -bottom-32 -left-12 h-96 w-96 rounded-full"
                            style={{
                                background: 'radial-gradient(circle at 50% 50%, rgba(122,169,230,0.18), transparent 60%)',
                                filter: 'blur(24px)',
                            }}
                        />

                        <div className="relative grid gap-12 lg:grid-cols-12">
                            <div className="lg:col-span-6">
                                <p className="text-[11px] uppercase tracking-[0.4em]" style={{ opacity: 0.65 }}>
                                    AI Assistance
                                </p>
                                <h3
                                    className="mt-4 text-3xl tracking-[-0.02em] sm:text-4xl lg:text-5xl"
                                    style={{ fontWeight: 500, lineHeight: 1.1, color: 'var(--c-on-dark)' }}
                                >
                                    Auditable AI.{' '}
                                    <span style={{ color: 'var(--c-mint)', fontStyle: 'italic' }}>
                                        Verdicts you can defend.
                                    </span>
                                </h3>
                                <p className="mt-5 max-w-md text-base" style={{ opacity: 0.8 }}>
                                    Claude-powered evidence review, threat suggestion, gap remediation, and
                                    security-config analysis. Every verdict carries strengths, gaps, and a confidence
                                    score — bound to the control it reviewed.
                                </p>

                                <ul className="mt-8 space-y-3 text-sm" style={{ opacity: 0.92 }}>
                                    {[
                                        'Three-tier verdict — Adequate · Partially · Insufficient',
                                        'Confidence scoring with cited strengths and gaps',
                                        'Tenant-scoped, queueable, no data leaves your charter',
                                    ].map((l) => (
                                        <li key={l} className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--c-mint)' }} />
                                            {l}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="lg:col-span-6">
                                <div
                                    className="rounded-2xl p-5"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)',
                                        boxShadow: '0 30px 60px -25px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="flex h-7 w-7 items-center justify-center rounded-md"
                                                style={{ background: 'rgba(176,228,204,0.18)', color: 'var(--c-mint)' }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="text-[11px] uppercase tracking-[0.3em]" style={{ opacity: 0.7 }}>
                                                Evidence Review
                                            </span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.25em]" style={{ opacity: 0.55 }}>
                                            Claude · Opus 4.5
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm" style={{ opacity: 0.85 }}>
                                        <span className="opacity-60">Control:</span> AC-2 — Account Management
                                    </p>
                                    <div
                                        className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]"
                                        style={{ background: 'rgba(176,228,204,0.18)', color: 'var(--c-mint)' }}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--c-mint)' }} />
                                        Verdict · Adequate · Confidence 92%
                                    </div>
                                    <div className="mt-5 grid gap-3 text-xs" style={{ opacity: 0.8 }}>
                                        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--c-mint)' }}>
                                                Strengths
                                            </p>
                                            <p className="mt-1.5">Quarterly access reviews documented; SoD enforced via RBAC.</p>
                                        </div>
                                        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--c-coral)' }}>
                                                Gaps
                                            </p>
                                            <p className="mt-1.5">Privileged break-glass accounts lack independent monitoring.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Metrics ─── */}
                <section
                    id="metrics"
                    className="relative z-10 mx-auto max-w-7xl px-6 py-24"
                    style={{ borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }}
                >
                    <div className="grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <p className="mb-4 text-[11px] uppercase tracking-[0.4em]" style={{ color: 'var(--c-accent)' }}>
                                A Living Ledger
                            </p>
                            <h2
                                className="text-4xl tracking-[-0.02em] lg:text-5xl"
                                style={{ color: 'var(--c-fg)', fontWeight: 500, lineHeight: 1.05 }}
                            >
                                Numbers that{' '}
                                <span style={{ color: 'var(--c-accent)', fontStyle: 'italic' }}>do not lie.</span>
                            </h2>
                            <p className="mt-6 max-w-md text-lg" style={{ color: 'var(--c-muted)' }}>
                                Every metric the platform records is reproducible, traceable, and bound to a control.
                                No vanity counts, no false comforts.
                            </p>
                            <div className="mt-8 flex items-center gap-3 text-xs" style={{ color: 'var(--c-muted)' }}>
                                <ActivitySquare className="h-4 w-4" style={{ color: 'var(--c-accent)' }} />
                                Snapshots taken nightly · trend lines reproducible by date
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div
                                className="grid grid-cols-2 overflow-hidden rounded-2xl"
                                style={{
                                    border: '1px solid var(--c-border)',
                                    background: 'var(--c-card)',
                                    boxShadow: 'var(--c-shadow-soft)',
                                }}
                            >
                                <div style={{ borderRight: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }}>
                                    <LivingMetric value={443} label="controls across the four frameworks" kicker="Controls" />
                                </div>
                                <div style={{ borderBottom: '1px solid var(--c-border)' }}>
                                    <LivingMetric value={9} label="AI-powered automation features" kicker="AI Features" delay={120} />
                                </div>
                                <div style={{ borderRight: '1px solid var(--c-border)' }}>
                                    <LivingMetric value={4} label="frameworks unified under one ledger" kicker="Frameworks" delay={240} />
                                </div>
                                <div>
                                    <LivingMetric value={5} label="international security standards referenced" kicker="Standards" delay={360} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
                    <div
                        className="relative overflow-hidden rounded-[22px] p-10 text-center sm:p-16 lg:p-20"
                        style={{
                            background: 'var(--c-bg-soft)',
                            border: '1px solid var(--c-border)',
                            boxShadow: 'var(--c-shadow-soft)',
                        }}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    'radial-gradient(50% 50% at 50% 0%, color-mix(in srgb, var(--c-accent) 14%, transparent), transparent 60%)',
                            }}
                        />
                        <div className="relative">
                            <h2
                                className="mx-auto max-w-3xl text-4xl tracking-[-0.02em] sm:text-5xl lg:text-6xl"
                                style={{ color: 'var(--c-fg)', fontWeight: 500, lineHeight: 1.05 }}
                            >
                                Your corporation deserves{' '}
                                <span style={{ color: 'var(--c-accent)', fontStyle: 'italic' }}>a charter</span>,
                                not a checklist.
                            </h2>
                            <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: 'var(--c-muted)' }}>
                                Begin the discipline. Bind your frameworks. Govern with intent.
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href="/corporation/register"
                                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm transition-all"
                                    style={{
                                        background: 'var(--c-primary)',
                                        color: 'var(--c-on-primary)',
                                        fontWeight: 500,
                                        boxShadow: 'var(--c-shadow)',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                                >
                                    Register your corporation
                                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                                </a>
                                <a
                                    href="/login"
                                    className="text-sm transition-colors"
                                    style={{ color: 'var(--c-muted)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-fg)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-muted)')}
                                >
                                    Already a signatory? Log in →
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Footer ─── */}
                <footer className="relative z-10" style={{ borderTop: '1px solid var(--c-border)' }}>
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="mb-3 flex items-center gap-3">
                                <AppLogoIcon className="size-16" />
                                <span
                                    className="text-xs uppercase"
                                    style={{ color: 'var(--c-fg)', letterSpacing: '0.28em', fontWeight: 600 }}
                                >
                                    GRC<span style={{ color: 'var(--c-muted)', fontWeight: 400 }}> · Charter</span>
                                </span>
                            </div>
                            <p className="max-w-sm text-sm" style={{ color: 'var(--c-muted)' }}>
                                Risk is not eliminated. It is governed. A scholarly platform for governance, risk, and
                                compliance — bound to ISO 27001, NIST, OWASP, and CIS.
                            </p>
                        </div>
                        <div>
                            <p className="mb-4 text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--c-accent)' }}>
                                Navigate
                            </p>
                            <ul className="space-y-2.5 text-sm">
                                {[
                                    { l: 'Features', h: '#features' },
                                    { l: 'About',    h: '/about' },
                                    { l: 'Team',     h: '/team' },
                                ].map((n) => (
                                    <li key={n.l}>
                                        <a
                                            href={n.h}
                                            className="transition-colors"
                                            style={{ color: 'var(--c-muted)' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-fg)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-muted)')}
                                        >
                                            {n.l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div
                        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6"
                        style={{ borderTop: '1px solid var(--c-border)' }}
                    >
                        <p className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                            © Twenty Twenty-Six · GRC Charter · All rights reserved
                        </p>
                        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--c-muted)' }}>
                            <span>Fides · Ratio · Ordo</span>
                            <ThemeToggle compact />
                        </div>
                    </div>
                </footer>

                <style>{`
                    @keyframes welcome-marquee     { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                    @keyframes welcome-pulse       { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.6); opacity: 1; } }
                    @keyframes welcome-fill        { from { width: 0%; } }
                    @keyframes welcome-scroll-line { 0%,100% { transform: scaleY(0.5); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } }

                    @media (prefers-reduced-motion: reduce) {
                        .welcome-root *,
                        .welcome-root *::before,
                        .welcome-root *::after {
                            animation-duration: 0.001ms !important;
                            transition-duration: 0.001ms !important;
                        }
                    }
                `}</style>
            </div>
        </>
    );
}
