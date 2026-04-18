import { Head } from '@inertiajs/react';
import {
    ShieldCheck, BarChart3, FileSearch, FolderOpen, ClipboardList,
    Users, Shield, Compass, BookOpen, Scale, Sparkles, ArrowRight,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

/* ────────────────────────────────────────────────────────────────────────────
   Opening Seal — a heraldic SVG that draws itself, then dissolves
   ────────────────────────────────────────────────────────────────────────── */

function OpeningSeal({ onDone }: { onDone: () => void }) {
    const [phase, setPhase] = useState<'drawing' | 'breaking' | 'gone'>('drawing');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('breaking'), 1900);
        const t2 = setTimeout(() => { setPhase('gone'); onDone(); }, 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); };
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
            {/* Skip button */}
            {!breaking && (
                <button
                    onClick={() => { setPhase('breaking'); setTimeout(() => { setPhase('gone'); onDone(); }, 700); }}
                    className="font-display absolute top-6 right-6 text-[9px] uppercase tracking-[0.3em] opacity-50 transition-opacity hover:opacity-100"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    Skip ▸
                </button>
            )}

            <div
                className="relative"
                style={{
                    transform: breaking ? 'scale(2.4) rotate(-8deg)' : 'scale(1)',
                    opacity: breaking ? 0 : 1,
                    transition: 'transform 900ms cubic-bezier(.6,0,.3,1), opacity 900ms ease-out',
                    filter: breaking ? 'blur(2px)' : 'none',
                }}
            >
                <svg width="320" height="320" viewBox="-160 -160 320 320" style={{ overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="seal-glow" cx="0" cy="0" r="0.6">
                            <stop offset="0%"   stopColor="#408A71" stopOpacity="0.7" />
                            <stop offset="60%"  stopColor="#408A71" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#408A71" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* center glow */}
                    <circle r="120" fill="url(#seal-glow)" style={{ animation: 'seal-pulse 1.6s ease-in-out infinite' }} />

                    {/* outer ornate ring */}
                    <circle
                        r="135" fill="none" stroke="#408A71" strokeWidth="0.5" strokeDasharray="1 4"
                        style={{ animation: 'seal-spin 18s linear infinite' }}
                    />

                    {/* primary ring */}
                    <circle
                        r="110" fill="none" stroke="#408A71" strokeWidth="1.2"
                        strokeDasharray="691" strokeDashoffset="691"
                        style={{ animation: 'seal-draw 1.0s 0.05s cubic-bezier(.7,0,.3,1) forwards' }}
                    />

                    {/* inner ring */}
                    <circle
                        r="92" fill="none" stroke="#7ABFA8" strokeWidth="0.5"
                        strokeDasharray="578" strokeDashoffset="578"
                        style={{ animation: 'seal-draw 0.9s 0.25s cubic-bezier(.7,0,.3,1) forwards' }}
                    />

                    {/* eight cardinal radial strokes */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const a = (i / 8) * Math.PI * 2;
                        const x1 = Math.cos(a) * 92, y1 = Math.sin(a) * 92;
                        const x2 = Math.cos(a) * 110, y2 = Math.sin(a) * 110;
                        return (
                            <line
                                key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="#408A71" strokeWidth="1"
                                strokeDasharray="20" strokeDashoffset="20"
                                style={{ animation: `seal-draw 0.4s ${0.5 + i * 0.04}s ease-out forwards` }}
                            />
                        );
                    })}

                    {/* shield */}
                    <path
                        d="M 0 -76 L 56 -50 L 56 18 Q 56 56 0 76 Q -56 56 -56 18 L -56 -50 Z"
                        fill="none" stroke="#408A71" strokeWidth="1.2"
                        strokeDasharray="380" strokeDashoffset="380"
                        style={{ animation: 'seal-draw 0.9s 0.55s cubic-bezier(.7,0,.3,1) forwards' }}
                    />

                    {/* shield diagonals */}
                    <line
                        x1="-56" y1="-50" x2="56" y2="76" stroke="#408A71" strokeWidth="0.4" opacity="0.5"
                        strokeDasharray="200" strokeDashoffset="200"
                        style={{ animation: 'seal-draw 0.5s 1.05s ease-out forwards' }}
                    />
                    <line
                        x1="56" y1="-50" x2="-56" y2="76" stroke="#408A71" strokeWidth="0.4" opacity="0.5"
                        strokeDasharray="200" strokeDashoffset="200"
                        style={{ animation: 'seal-draw 0.5s 1.05s ease-out forwards' }}
                    />

                    {/* central monogram star */}
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

                    {/* circumscribed motto */}
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

                {/* tagline beneath */}
                <div
                    className="font-display absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-[10px] uppercase"
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
   Compliance Orrery — animated rotating rings of frameworks
   ────────────────────────────────────────────────────────────────────────── */

const ORRERY_FRAMEWORKS = [
    { code: 'ISO 27001', orbit: 0,  speed: 36,  size: 7  },
    { code: 'NIST',      orbit: 1,  speed: -42, size: 6  },
    { code: 'OWASP',     orbit: 2,  speed: 30,  size: 6  },
    { code: 'CIS',       orbit: 3,  speed: -54, size: 5  },
    { code: 'SOC 2',     orbit: 0,  speed: 36,  size: 5, phase: 180 },
    { code: 'PCI DSS',   orbit: 2,  speed: 30,  size: 5, phase: 200 },
    { code: 'GDPR',      orbit: 1,  speed: -42, size: 5, phase: 90  },
    { code: 'HIPAA',     orbit: 3,  speed: -54, size: 4, phase: 240 },
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
        <div className="relative mx-auto h-[480px] w-full max-w-[480px]">
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
                            <stop offset="0%"   stopColor="#B0E4CC" stopOpacity="1"   />
                            <stop offset="40%"  stopColor="#408A71" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#408A71" stopOpacity="0"   />
                        </radialGradient>
                        <radialGradient id="orrery-aura" cx="0" cy="0" r="0.7">
                            <stop offset="0%"   stopColor="#408A71" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#408A71" stopOpacity="0"   />
                        </radialGradient>
                    </defs>

                    <circle r="220" fill="url(#orrery-aura)" />

                    {radii.map((r, i) => (
                        <g key={i}>
                            <circle
                                r={r} fill="none"
                                stroke="#285A48" strokeWidth="0.6"
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

                    {/* rotating cardinal markers */}
                    <g
                        style={{
                            transformOrigin: '0 0',
                            transform: `rotate(${(t * 4) % 360}deg)`,
                        }}
                    >
                        {[0, 90, 180, 270].map(a => {
                            const x = Math.cos(a * Math.PI / 180) * 232;
                            const y = Math.sin(a * Math.PI / 180) * 232;
                            return (
                                <text
                                    key={a} x={x} y={y + 3} textAnchor="middle"
                                    fontSize="10" fill="#7ABFA8"
                                    fontFamily="Cinzel, serif" letterSpacing="3"
                                >✶</text>
                            );
                        })}
                    </g>

                    {/* central core */}
                    <circle r="50" fill="url(#orrery-core)" />
                    <circle r="22" fill="none" stroke="#B0E4CC" strokeWidth="0.5" opacity="0.6" />
                    <text
                        x="0" y="6" textAnchor="middle"
                        fontSize="14" fontFamily="Cinzel, serif" fill="#091413"
                        letterSpacing="4" style={{ fontWeight: 600 }}
                    >GRC</text>

                    {/* orbital framework nodes */}
                    {ORRERY_FRAMEWORKS.map((f, i) => {
                        const r = radii[f.orbit];
                        const speed = f.speed;
                        const phase = (f.phase ?? 0) * Math.PI / 180;
                        const a = (t * speed * Math.PI / 180) + phase;
                        const x = Math.cos(a) * r;
                        const y = Math.sin(a) * r;
                        return (
                            <g key={i} style={{ transform: `translate(${x}px, ${y}px)` }}>
                                <circle r={f.size + 4} fill="#408A71" opacity="0.18" />
                                <circle r={f.size}     fill="#0D1F1C" stroke="#408A71" strokeWidth="1" />
                                <circle r={f.size - 2.5} fill="#B0E4CC" opacity="0.85" />
                                <text
                                    x={f.size + 8} y="3"
                                    fontSize="9" fontFamily="Cinzel, serif"
                                    fill="#7ABFA8" letterSpacing="2"
                                >{f.code}</text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* corner brackets */}
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
                        borderLeft: '1px solid var(--primary)',
                        borderTop:  '1px solid var(--primary)',
                        opacity: 0.4,
                        transform: `rotate(${c.r}deg)`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Marquee — endless serif motto strip
   ────────────────────────────────────────────────────────────────────────── */

function MottoMarquee() {
    const phrases = [
        'GOVERN WITH INTENT', 'MEASURE EVERY RISK', 'AUDIT WITH CLARITY',
        'COMPLY WITH PURPOSE', 'EVIDENCE THE TRUTH', 'TRUST · BUT VERIFY',
    ];
    const items = [...phrases, ...phrases];
    return (
        <div
            className="relative overflow-hidden py-5"
            style={{
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: 'color-mix(in srgb, var(--card) 30%, transparent)',
            }}
        >
            <div
                className="flex w-max gap-12 whitespace-nowrap"
                style={{ animation: 'marquee 38s linear infinite' }}
            >
                {items.map((p, i) => (
                    <span
                        key={i}
                        className="font-display flex items-center gap-12 text-[11px] uppercase"
                        style={{ color: 'var(--muted-foreground)', letterSpacing: '0.5em' }}
                    >
                        {p}
                        <span style={{ color: 'var(--primary)' }}>✶</span>
                    </span>
                ))}
            </div>
            <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Living Metric — count-up
   ────────────────────────────────────────────────────────────────────────── */

function LivingMetric({
    value, suffix, label, kicker, delay = 0,
}: { value: number; suffix?: string; label: string; kicker: string; delay?: number }) {
    const { ref, shown } = useReveal<HTMLDivElement>(0.4);
    const v = useCountUp(value, 1600, shown);
    const display = value >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1);
    return (
        <div
            ref={ref}
            className="relative px-6 py-10"
            style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity .8s ${delay}ms ease, transform .8s ${delay}ms cubic-bezier(.2,.7,.2,1)`,
            }}
        >
            <p className="font-display mb-3 text-[9px] uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
                {kicker}
            </p>
            <p
                className="font-heading mb-2 text-6xl leading-none lg:text-7xl"
                style={{ color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}
            >
                {display}{suffix && <span style={{ color: 'var(--muted-foreground)' }}>{suffix}</span>}
            </p>
            <p className="font-body text-sm italic" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Chapter — features as illuminated manuscript chapters
   ────────────────────────────────────────────────────────────────────────── */

const CHAPTERS = [
    {
        roman: 'I',   icon: BarChart3,
        title: 'Risk Assessment',
        latin: 'De Periculo',
        body: 'An ISO 27005 likelihood-by-impact matrix that scores every threat against every asset, then traces each treatment from acceptance to closure.',
    },
    {
        roman: 'II',  icon: ClipboardList,
        title: 'Compliance Assessments',
        latin: 'De Mensura',
        body: 'Self-assessment questionnaires across ISO 27001, NIST, OWASP and CIS — generated from the same control library, scored against the same yardstick.',
    },
    {
        roman: 'III', icon: FileSearch,
        title: 'Gap Analysis',
        latin: 'De Discrepantiis',
        body: 'Surface every non-compliant and partially compliant control in a single ledger, ranked by exposure, framework, and the time they have been open.',
    },
    {
        roman: 'IV',  icon: FolderOpen,
        title: 'Evidence Management',
        latin: 'De Testimonio',
        body: 'Upload, version, and approve evidence files bound to specific controls. Auditors see the chain; reviewers see the queue; owners see what is missing.',
    },
    {
        roman: 'V',   icon: ShieldCheck,
        title: 'Audit Trail',
        latin: 'De Memoria',
        body: 'A tamper-evident log of every action the platform records — who, what, when, from where — exportable to any internal or external auditor on demand.',
    },
    {
        roman: 'VI',  icon: Users,
        title: 'Role-Based Access',
        latin: 'De Officio',
        body: 'Granular Admin, Auditor, and User roles. Each role sees only what the discipline of separation requires, never more, never less.',
    },
];

function Chapter({ ch, i }: { ch: (typeof CHAPTERS)[number]; i: number }) {
    const { ref, shown } = useReveal<HTMLDivElement>(0.25);
    const Icon = ch.icon;
    const flipped = i % 2 === 1;
    return (
        <div
            ref={ref}
            className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-16"
            style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 1s ease, transform 1s cubic-bezier(.2,.7,.2,1)',
            }}
        >
            <div className={`lg:col-span-4 ${flipped ? 'lg:order-last' : ''}`}>
                <div
                    className="relative flex aspect-square items-center justify-center"
                    style={{
                        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                        background: 'linear-gradient(140deg, color-mix(in srgb, var(--card) 85%, transparent), color-mix(in srgb, var(--background) 95%, transparent))',
                    }}
                >
                    {/* corner marks */}
                    <span className="absolute top-0 left-0 h-4 w-4 border-t border-l" style={{ borderColor: 'var(--primary)' }} />
                    <span className="absolute top-0 right-0 h-4 w-4 border-t border-r" style={{ borderColor: 'var(--primary)' }} />
                    <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l" style={{ borderColor: 'var(--primary)' }} />
                    <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r" style={{ borderColor: 'var(--primary)' }} />

                    {/* roman numeral as drop-cap */}
                    <span
                        className="font-heading absolute select-none text-[180px] leading-none"
                        style={{
                            color: 'color-mix(in srgb, var(--primary) 9%, transparent)',
                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        }}
                    >{ch.roman}</span>

                    <Icon className="relative h-14 w-14" style={{ color: 'var(--primary)' }} strokeWidth={1.2} />

                    <span
                        className="font-display absolute bottom-3 right-3 text-[8px] uppercase tracking-[0.3em]"
                        style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}
                    >
                        Cap. {ch.roman}
                    </span>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="flex items-baseline gap-4">
                    <span
                        className="font-display text-[10px] uppercase tracking-[0.4em]"
                        style={{ color: 'var(--primary)' }}
                    >
                        Chapter {ch.roman}
                    </span>
                    <span className="h-px flex-1" style={{ background: 'color-mix(in srgb, var(--border) 80%, transparent)' }} />
                    <span
                        className="font-body text-xs italic"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        {ch.latin}
                    </span>
                </div>
                <h3 className="font-heading mt-4 text-4xl lg:text-5xl" style={{ color: 'var(--foreground)' }}>
                    {ch.title}
                </h3>
                <p
                    className="font-body mt-5 max-w-xl text-lg leading-relaxed"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    {ch.body}
                </p>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Hero typography with word-by-word reveal
   ────────────────────────────────────────────────────────────────────────── */

function HeroTitle({ start }: { start: boolean }) {
    const lines = useMemo(() => ([
        ['Risk', 'is', 'not'],
        ['eliminated.'],
        ['It', 'is', 'governed.'],
    ]), []);
    let idx = 0;
    return (
        <h1
            className="font-heading text-6xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
            style={{ color: 'var(--foreground)' }}
        >
            {lines.map((line, li) => (
                <span key={li} className="block">
                    {line.map((w, wi) => {
                        const i = idx++;
                        const isAccent = w === 'governed.';
                        return (
                            <span
                                key={wi}
                                className="inline-block"
                                style={{
                                    marginRight: '0.25em',
                                    color: isAccent ? 'var(--primary)' : 'inherit',
                                    fontStyle: isAccent ? 'italic' : 'normal',
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
   Tenets — three pillars
   ────────────────────────────────────────────────────────────────────────── */

const TENETS = [
    { icon: Compass, glyph: 'I',   title: 'Governance', body: 'A single source of authority for every policy, every framework, every owner.' },
    { icon: Scale,   glyph: 'II',  title: 'Risk',       body: 'Likelihood and impact, scored on a common scale, treated on a common timeline.' },
    { icon: BookOpen,glyph: 'III', title: 'Compliance', body: 'Continuous evidence, mapped to controls, mapped to obligations, mapped to outcomes.' },
];

function Tenets() {
    const { ref, shown } = useReveal<HTMLDivElement>(0.2);
    return (
        <section ref={ref} className="mx-auto max-w-7xl px-6 py-24">
            <div
                className="mb-14 text-center"
                style={{
                    opacity: shown ? 1 : 0,
                    transform: shown ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all .8s ease',
                }}
            >
                <p
                    className="font-display mb-3 text-[10px] uppercase tracking-[0.5em]"
                    style={{ color: 'var(--primary)' }}
                >
                    The Three Tenets
                </p>
                <h2 className="font-heading text-4xl lg:text-5xl" style={{ color: 'var(--foreground)' }}>
                    One discipline,<br />
                    <span style={{ color: 'var(--primary)' }} className="italic">three orders.</span>
                </h2>
            </div>

            <div className="grid gap-px" style={{ background: 'var(--border)', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TENETS.map((t, i) => {
                    const Icon = t.icon;
                    return (
                        <div
                            key={t.title}
                            className="group relative flex flex-col items-start p-10"
                            style={{
                                background: 'var(--background)',
                                opacity: shown ? 1 : 0,
                                transform: shown ? 'translateY(0)' : 'translateY(30px)',
                                transition: `opacity .9s ${200 + i * 150}ms ease, transform .9s ${200 + i * 150}ms cubic-bezier(.2,.7,.2,1)`,
                            }}
                        >
                            <span
                                className="font-display absolute top-6 right-6 text-[9px] uppercase tracking-[0.3em]"
                                style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}
                            >
                                {t.glyph}
                            </span>

                            <div
                                className="mb-8 flex h-12 w-12 items-center justify-center"
                                style={{
                                    border: '1px solid var(--primary)',
                                    background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                                }}
                            >
                                <Icon className="h-5 w-5" style={{ color: 'var(--primary)' }} strokeWidth={1.4} />
                            </div>

                            <h3 className="font-heading mb-3 text-3xl" style={{ color: 'var(--foreground)' }}>
                                {t.title}
                            </h3>
                            <p className="font-body text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                {t.body}
                            </p>

                            {/* hover sweep */}
                            <span
                                className="pointer-events-none absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                                style={{ background: 'var(--primary)' }}
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ────────────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────────── */

export default function Welcome() {
    const [sealDone, setSealDone] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="GRC System — Risk is not eliminated. It is governed." />

            <OpeningSeal onDone={() => setSealDone(true)} />

            <div
                className="relative min-h-screen overflow-x-hidden antialiased"
                style={{ background: 'var(--background)', color: 'var(--foreground)' }}
            >
                {/* Background fixtures: subtle grid + radial light */}
                <div
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(color-mix(in srgb, var(--border) 25%, transparent) 1px, transparent 1px),' +
                            'linear-gradient(90deg, color-mix(in srgb, var(--border) 25%, transparent) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%)',
                        opacity: 0.35,
                    }}
                />
                <div
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{
                        background: 'radial-gradient(ellipse at 70% 10%, color-mix(in srgb, var(--primary) 8%, transparent), transparent 55%)',
                    }}
                />

                {/* ─── Nav ─── */}
                <header
                    className="sticky top-0 z-40"
                    style={{
                        background: 'color-mix(in srgb, var(--background) 85%, transparent)',
                        borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                        backdropFilter: 'blur(14px)',
                    }}
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full"
                                style={{
                                    background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--primary) 50%, transparent)',
                                }}
                            >
                                <Shield className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
                            </div>
                            <span
                                className="font-display text-xs uppercase"
                                style={{ color: 'var(--foreground)', letterSpacing: '0.35em' }}
                            >
                                GRC · Charter
                            </span>
                        </div>
                        <nav className="hidden items-center gap-8 md:flex">
                            {[
                                { l: 'Tenets',     h: '#tenets' },
                                { l: 'Frameworks', h: '#frameworks' },
                                { l: 'Chapters',   h: '#chapters' },
                                { l: 'About',      h: '/about' },
                            ].map(n => (
                                <a
                                    key={n.l} href={n.h}
                                    className="font-display text-[10px] uppercase tracking-[0.3em] transition-colors"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    {n.l}
                                </a>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <a
                                href="/login"
                                className="font-display rounded px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors"
                                style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                            >
                                Log In
                            </a>
                            <a
                                href="/corporation/register"
                                className="font-display rounded px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-all"
                                style={{
                                    background: 'var(--primary)', color: 'var(--primary-foreground)',
                                    boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
                                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                            >
                                Register
                            </a>
                        </div>
                    </div>
                </header>

                {/* ─── Hero ─── */}
                <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
                    <div className="grid items-center gap-16 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <div
                                className="mb-8 inline-flex items-center gap-3"
                                style={{
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(10px)',
                                    transition: 'all .7s ease',
                                }}
                            >
                                <span className="h-px w-10" style={{ background: 'var(--primary)' }} />
                                <span
                                    className="font-display text-[10px] uppercase"
                                    style={{ color: 'var(--primary)', letterSpacing: '0.5em' }}
                                >
                                    Anno Securitatis · MMXXVI
                                </span>
                            </div>

                            <HeroTitle start={sealDone} />

                            <p
                                className="font-body mt-10 max-w-xl text-xl leading-relaxed italic"
                                style={{
                                    color: 'var(--muted-foreground)',
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all .9s 1.0s cubic-bezier(.2,.7,.2,1)',
                                }}
                            >
                                A scholarly platform for governance, risk, and compliance — where ISO&nbsp;27001, NIST,
                                OWASP, and CIS converge into one disciplined ledger.
                            </p>

                            <div
                                className="mt-10 flex flex-wrap items-center gap-4"
                                style={{
                                    opacity: sealDone ? 1 : 0,
                                    transform: sealDone ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all .9s 1.2s cubic-bezier(.2,.7,.2,1)',
                                }}
                            >
                                <a
                                    href="/corporation/register"
                                    className="font-display group relative inline-flex items-center gap-3 overflow-hidden px-7 py-4 text-[11px] uppercase tracking-[0.3em] transition-all"
                                    style={{
                                        background: 'var(--primary)', color: 'var(--primary-foreground)',
                                        boxShadow: '0 6px 24px color-mix(in srgb, var(--primary) 30%, transparent)',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
                                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                                >
                                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
                                    Sign the Charter
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.6} />
                                </a>

                                <a
                                    href="#tenets"
                                    className="font-display group inline-flex items-center gap-3 px-2 py-4 text-[11px] uppercase tracking-[0.3em] transition-colors"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    Read the Tenets
                                    <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
                                </a>
                            </div>

                            {/* signature line */}
                            <div
                                className="mt-16 flex items-center gap-6"
                                style={{
                                    opacity: sealDone ? 1 : 0,
                                    transition: 'all 1s 1.6s ease',
                                }}
                            >
                                <span
                                    className="font-display text-[9px] uppercase"
                                    style={{ color: 'var(--muted-foreground)', letterSpacing: '0.4em' }}
                                >
                                    Bound by
                                </span>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    {['ISO 27001', 'NIST 800-53', 'OWASP ASVS', 'CIS Benchmarks'].map(b => (
                                        <span
                                            key={b}
                                            className="font-display text-[10px] uppercase"
                                            style={{ color: 'var(--foreground)', letterSpacing: '0.25em', opacity: 0.85 }}
                                        >
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div
                            className="lg:col-span-5"
                            style={{
                                opacity: sealDone ? 1 : 0,
                                transform: sealDone ? 'scale(1)' : 'scale(0.92)',
                                transition: 'all 1.2s 0.4s cubic-bezier(.2,.7,.2,1)',
                            }}
                        >
                            <ComplianceOrrery />
                        </div>
                    </div>

                    {/* scroll indicator */}
                    <div
                        className="mt-16 flex flex-col items-center gap-2"
                        style={{
                            opacity: sealDone && scrollY < 40 ? 0.6 : 0,
                            transition: 'opacity .6s ease',
                        }}
                    >
                        <span
                            className="font-display text-[9px] uppercase"
                            style={{ color: 'var(--muted-foreground)', letterSpacing: '0.4em' }}
                        >
                            Descend
                        </span>
                        <span
                            className="block h-10 w-px"
                            style={{
                                background: 'linear-gradient(to bottom, var(--primary), transparent)',
                                animation: 'scroll-line 2s ease-in-out infinite',
                            }}
                        />
                    </div>
                    <style>{`@keyframes scroll-line { 0%,100% { transform: scaleY(0.5); transform-origin: top } 50% { transform: scaleY(1); transform-origin: top } }`}</style>
                </section>

                {/* ─── Marquee ─── */}
                <MottoMarquee />

                {/* ─── Tenets ─── */}
                <div id="tenets">
                    <Tenets />
                </div>

                {/* ─── Frameworks Atlas ─── */}
                <section
                    id="frameworks"
                    className="relative z-10 mx-auto max-w-7xl px-6 py-24"
                    style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
                >
                    <div className="grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <p
                                className="font-display mb-4 text-[10px] uppercase tracking-[0.5em]"
                                style={{ color: 'var(--primary)' }}
                            >
                                A Living Ledger
                            </p>
                            <h2 className="font-heading mb-6 text-4xl lg:text-5xl" style={{ color: 'var(--foreground)' }}>
                                Numbers that<br /><span className="italic" style={{ color: 'var(--primary)' }}>do not lie.</span>
                            </h2>
                            <p className="font-body max-w-md text-lg leading-relaxed italic" style={{ color: 'var(--muted-foreground)' }}>
                                Every metric the Charter records is reproducible, traceable, and bound to a control. No vanity counts.
                                No false comforts.
                            </p>
                        </div>

                        <div className="lg:col-span-7">
                            <div
                                className="grid grid-cols-2 gap-px"
                                style={{ background: 'var(--border)' }}
                            >
                                <div style={{ background: 'var(--background)' }}>
                                    <LivingMetric value={443} label="controls across the four frameworks" kicker="Controls" />
                                </div>
                                <div style={{ background: 'var(--background)' }}>
                                    <LivingMetric value={94.2} suffix="%" label="median compliance posture" kicker="Posture" delay={120} />
                                </div>
                                <div style={{ background: 'var(--background)' }}>
                                    <LivingMetric value={4} label="frameworks unified under one ledger" kicker="Frameworks" delay={240} />
                                </div>
                                <div style={{ background: 'var(--background)' }}>
                                    <LivingMetric value={1247} label="evidence files indexed and verifiable" kicker="Evidence" delay={360} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Chapters ─── */}
                <section id="chapters" className="relative z-10 mx-auto max-w-6xl px-6 py-28">
                    <div className="mb-20 text-center">
                        <p
                            className="font-display mb-4 text-[10px] uppercase tracking-[0.5em]"
                            style={{ color: 'var(--primary)' }}
                        >
                            The Six Chapters
                        </p>
                        <h2 className="font-heading text-4xl lg:text-6xl" style={{ color: 'var(--foreground)' }}>
                            Everything is a chapter,<br />
                            <span className="italic" style={{ color: 'var(--primary)' }}>nothing is a feature.</span>
                        </h2>
                        <div className="ornate-divider mx-auto mt-10 w-60" />
                    </div>

                    <div className="divide-y" style={{ borderColor: 'color-mix(in srgb, var(--border) 70%, transparent)' }}>
                        {CHAPTERS.map((ch, i) => (
                            <div key={ch.title} style={{ borderTop: i === 0 ? 'none' : '1px solid color-mix(in srgb, var(--border) 70%, transparent)' }}>
                                <Chapter ch={ch} i={i} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Charter (CTA) ─── */}
                <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
                    <div
                        className="ornate-frame relative overflow-hidden p-14 text-center md:p-20"
                        style={{
                            border: '1px solid color-mix(in srgb, var(--primary) 35%, transparent)',
                            background:
                                'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 60%),' +
                                'color-mix(in srgb, var(--card) 60%, transparent)',
                        }}
                    >
                        {/* ornamental top */}
                        <div className="ornate-divider mx-auto mb-10 w-72" />

                        <p
                            className="font-display mb-6 text-[10px] uppercase"
                            style={{ color: 'var(--primary)', letterSpacing: '0.6em' }}
                        >
                            Anno Domini MMXXVI
                        </p>

                        <h2 className="font-heading mx-auto max-w-3xl text-4xl leading-tight md:text-6xl" style={{ color: 'var(--foreground)' }}>
                            Your corporation deserves<br />
                            a <span className="italic" style={{ color: 'var(--primary)' }}>charter</span>, not a checklist.
                        </h2>

                        <p
                            className="font-body mx-auto mt-8 max-w-xl text-lg leading-relaxed italic"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            Begin the discipline. Bind your frameworks. Govern with intent. The Charter awaits your signature.
                        </p>

                        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="/corporation/register"
                                className="font-display group inline-flex items-center gap-3 px-10 py-4 text-[11px] uppercase tracking-[0.3em] transition-all"
                                style={{
                                    background: 'var(--primary)', color: 'var(--primary-foreground)',
                                    boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 35%, transparent)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
                                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                            >
                                Sign the Charter
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.6} />
                            </a>
                            <a
                                href="/login"
                                className="font-display inline-flex items-center gap-2 px-6 py-4 text-[11px] uppercase tracking-[0.3em] transition-colors"
                                style={{ color: 'var(--muted-foreground)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                            >
                                Already a signatory? Log in →
                            </a>
                        </div>

                        <div className="ornate-divider mx-auto mt-12 w-72" />
                    </div>
                </section>

                {/* ─── Footer ─── */}
                <footer className="relative z-10" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
                        <div>
                            <div className="mb-3 flex items-center gap-3">
                                <div
                                    className="flex h-7 w-7 items-center justify-center rounded-full"
                                    style={{
                                        background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)',
                                    }}
                                >
                                    <Shield className="h-3 w-3" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
                                </div>
                                <span
                                    className="font-display text-xs uppercase"
                                    style={{ color: 'var(--foreground)', letterSpacing: '0.35em' }}
                                >
                                    GRC · Charter
                                </span>
                            </div>
                            <p className="font-body text-sm italic" style={{ color: 'var(--muted-foreground)' }}>
                                Risk is not eliminated. It is governed.
                            </p>
                        </div>
                        <div>
                            <p className="font-display mb-4 text-[9px] uppercase tracking-[0.4em]" style={{ color: 'var(--primary)' }}>
                                Navigate
                            </p>
                            <ul className="space-y-2">
                                {[
                                    { l: 'Tenets',     h: '#tenets' },
                                    { l: 'Frameworks', h: '#frameworks' },
                                    { l: 'Chapters',   h: '#chapters' },
                                    { l: 'About',      h: '/about' },
                                ].map(n => (
                                    <li key={n.l}>
                                        <a
                                            href={n.h}
                                            className="font-body text-sm italic transition-colors"
                                            style={{ color: 'var(--muted-foreground)' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                        >
                                            {n.l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="font-display mb-4 text-[9px] uppercase tracking-[0.4em]" style={{ color: 'var(--primary)' }}>
                                Bound to
                            </p>
                            <ul className="space-y-2">
                                {['ISO 27001', 'NIST 800-53', 'OWASP ASVS', 'CIS Benchmarks'].map(b => (
                                    <li key={b} className="font-body text-sm italic" style={{ color: 'var(--muted-foreground)' }}>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div
                        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"
                        style={{ borderTop: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}
                    >
                        <p
                            className="font-display text-[9px] uppercase"
                            style={{ color: 'var(--muted-foreground)', letterSpacing: '0.3em', opacity: 0.5 }}
                        >
                            © MMXXVI · GRC Charter · All rights reserved
                        </p>
                        <p
                            className="font-display text-[9px] uppercase"
                            style={{ color: 'var(--muted-foreground)', letterSpacing: '0.3em', opacity: 0.5 }}
                        >
                            ✶ Fides · Ratio · Ordo ✶
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
