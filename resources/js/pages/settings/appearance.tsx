import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useFont } from '@/hooks/use-font';
import { usePreferences } from '@/hooks/use-preferences';
import { useTheme } from '@/hooks/use-theme';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

export default function AppearancePage() {
    const { themeName, setTheme, themes } = useTheme();
    const { font, setFont, fonts } = useFont();
    const {
        preferences,
        setRadius,
        setDensity,
        setMotion,
        setSidebarWidth,
        radiusPresets,
        densityPresets,
        motionPresets,
        sidebarWidths,
    } = usePreferences();

    return (
        <AdminLayout>
            <Head title="Appearance" />

            <div className="space-y-8">
                <div>
                    <h1 className="font-heading text-4xl font-normal text-foreground">
                        Appearance
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Personalize your GRC platform with custom themes and typography.
                    </p>
                </div>

                {/* Themes Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-heading font-normal">Color Theme</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Choose how the platform looks. Changes apply instantly.
                        </p>
                    </div>

                    {/* Theme grid — sorted: HC → Light → Dark */}
                    {(['high-contrast', 'light', 'dark'] as const).map((cat) => {
                        const group = themes.filter((t) => t.category === cat);
                        if (!group.length) return null;
                        const catLabel = cat === 'high-contrast' ? 'High Contrast' : cat === 'light' ? 'Light' : 'Dark';
                        return (
                            <div key={cat} className="space-y-3">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">{catLabel}</p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {group.map((theme) => {
                                        const isActive = themeName === theme.name;
                                        const [bg, card, primary, accent] = theme.preview;
                                        return (
                                            <button
                                                key={theme.name}
                                                onClick={() => setTheme(theme.name)}
                                                className={cn(
                                                    'group relative rounded text-left transition-all duration-150 focus:outline-none',
                                                    isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100',
                                                )}
                                                title={theme.label}
                                            >
                                                {/* Mini UI preview */}
                                                <div
                                                    className="rounded overflow-hidden"
                                                    style={{
                                                        border: isActive ? `2px solid ${primary}` : '2px solid rgba(128,128,128,0.2)',
                                                        boxShadow: isActive ? `0 0 12px ${primary}40` : 'none',
                                                    }}
                                                >
                                                    {/* Titlebar */}
                                                    <div
                                                        className="flex items-center gap-1 px-2 py-1"
                                                        style={{ background: bg, borderBottom: `1px solid ${card}` }}
                                                    >
                                                        <div className="h-1.5 w-1.5 rounded-full opacity-60" style={{ background: primary }} />
                                                        <div className="h-1 flex-1 rounded-full opacity-20" style={{ background: accent }} />
                                                        <div className="h-1 w-4 rounded-full opacity-40" style={{ background: primary }} />
                                                    </div>
                                                    {/* App body */}
                                                    <div className="flex" style={{ background: bg }}>
                                                        <div className="w-7 shrink-0 p-1 space-y-1" style={{ background: card, borderRight: `1px solid ${primary}22` }}>
                                                            <div className="h-1.5 w-1.5 rounded-full mx-auto" style={{ background: primary }} />
                                                            {[0.4, 0.4, 0.4, 0.25, 0.25].map((op, i) => (
                                                                <div key={i} className="h-1 rounded-full" style={{ background: accent, opacity: op }} />
                                                            ))}
                                                        </div>
                                                        <div className="flex-1 p-1.5 space-y-1.5">
                                                            <div className="flex gap-1">
                                                                {[0.9, 0.6, 0.4].map((op, i) => (
                                                                    <div key={i} className="flex-1 rounded-sm p-1" style={{ background: card }}>
                                                                        <div className="h-1 w-2/3 rounded-full mb-0.5" style={{ background: primary, opacity: op }} />
                                                                        <div className="h-0.5 w-full rounded-full opacity-20" style={{ background: accent }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="h-3 rounded-sm flex items-center justify-center" style={{ background: primary }}>
                                                                <div className="h-0.5 w-5 rounded-full opacity-50" style={{ background: bg }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Label */}
                                                <div className="mt-1.5 px-0.5 flex items-start justify-between gap-1">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium leading-tight truncate">{theme.label}</p>
                                                        <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-1 opacity-80">{theme.description}</p>
                                                    </div>
                                                    {isActive && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: primary }} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Active theme token strip */}
                    <div className="border border-border rounded p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                            Active — {themes.find((t) => t.name === themeName)?.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {themes.find((t) => t.name === themeName)?.preview.map((hex, i) => {
                                const labels = ['Background', 'Card', 'Primary', 'Accent'];
                                return (
                                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <div className="h-5 w-5 rounded-sm border border-white/10 shrink-0" style={{ background: hex }} />
                                        <span className="font-mono">{labels[i]}</span>
                                        <span className="font-mono opacity-50">{hex}</span>
                                        {i < 3 && <span className="opacity-20 mx-1">·</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Fonts Section */}
                <div className="space-y-4 border-t border-border pt-8">
                    <div>
                        <h2 className="text-xl font-heading font-normal">Typography</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select a font family for the entire interface.
                        </p>
                    </div>

                    {/* Font selector — grouped by category */}
                    {(['serif', 'sans', 'mono', 'display'] as const).map((cat) => {
                        const group = fonts.filter((f) => f.category === cat);
                        if (!group.length) return null;
                        return (
                            <div key={cat} className="space-y-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                    {cat === 'sans' ? 'Sans-serif' : cat === 'mono' ? 'Monospace' : cat === 'display' ? 'Display' : 'Serif'}
                                </p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                    {group.map((fontConfig) => {
                                        const isActive = font === fontConfig.name;
                                        return (
                                            <button
                                                key={fontConfig.name}
                                                onClick={() => setFont(fontConfig.name)}
                                                className={cn(
                                                    'rounded p-3 text-left transition-all duration-150 border',
                                                    isActive
                                                        ? 'border-primary bg-card'
                                                        : 'border-border hover:border-primary bg-card/50',
                                                )}
                                            >
                                                <p
                                                    className="text-xl text-foreground mb-1 leading-none"
                                                    style={{ fontFamily: fontConfig.stack }}
                                                >
                                                    Aa
                                                </p>
                                                <p className="text-xs font-medium text-foreground flex items-center gap-1 leading-tight">
                                                    {fontConfig.label}
                                                    {isActive && <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: 'var(--primary)' }} />}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 opacity-80">
                                                    {fontConfig.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Interface Preferences */}
                <div className="space-y-6 border-t border-border pt-8">
                    <div>
                        <h2 className="text-xl font-heading font-normal">Interface</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Fine-tune spacing, motion, and layout preferences.
                        </p>
                    </div>

                    {/* Border Radius */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Border Radius</p>
                        <div className="flex flex-wrap gap-2">
                            {radiusPresets.map((preset) => {
                                const isActive = preferences.radius === preset.name;
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => setRadius(preset.name)}
                                        title={preset.description}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded border px-3 py-2 text-left transition-all duration-150',
                                            isActive
                                                ? 'border-primary bg-card text-foreground'
                                                : 'border-border bg-card/50 text-muted-foreground hover:border-primary hover:text-foreground',
                                        )}
                                    >
                                        {/* Visual preview of the radius */}
                                        <div
                                            className="h-5 w-5 shrink-0 border-2"
                                            style={{
                                                borderColor: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                                                borderRadius: preset.value,
                                            }}
                                        />
                                        <div>
                                            <p className="text-xs font-medium leading-tight">{preset.label}</p>
                                            <p className="text-xs opacity-80 leading-tight mt-0.5">{preset.description}</p>
                                        </div>
                                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 ml-auto" style={{ color: 'var(--primary)' }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Density */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Spacing Density</p>
                        <div className="flex flex-wrap gap-2">
                            {densityPresets.map((preset) => {
                                const isActive = preferences.density === preset.name;
                                const lines = preset.name === 'compact' ? [3, 2, 2] : preset.name === 'comfortable' ? [5, 4, 4] : [4, 3, 3];
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => setDensity(preset.name)}
                                        title={preset.description}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded border px-3 py-2 text-left transition-all duration-150',
                                            isActive
                                                ? 'border-primary bg-card text-foreground'
                                                : 'border-border bg-card/50 text-muted-foreground hover:border-primary hover:text-foreground',
                                        )}
                                    >
                                        {/* Visual preview: stacked lines with varying gaps */}
                                        <div className="flex flex-col shrink-0" style={{ gap: `${lines[0]}px` }}>
                                            {[1, 0.7, 0.4].map((op, i) => (
                                                <div
                                                    key={i}
                                                    className="h-1 w-6 rounded-full"
                                                    style={{
                                                        background: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                                                        opacity: op,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium leading-tight">{preset.label}</p>
                                            <p className="text-xs opacity-80 leading-tight mt-0.5">{preset.description}</p>
                                        </div>
                                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 ml-auto" style={{ color: 'var(--primary)' }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Motion */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Motion</p>
                        <div className="flex flex-wrap gap-2">
                            {motionPresets.map((preset) => {
                                const isActive = preferences.motion === preset.name;
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => setMotion(preset.name)}
                                        title={preset.description}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded border px-3 py-2 text-left transition-all duration-150',
                                            isActive
                                                ? 'border-primary bg-card text-foreground'
                                                : 'border-border bg-card/50 text-muted-foreground hover:border-primary hover:text-foreground',
                                        )}
                                    >
                                        {/* Visual: dots representing motion level */}
                                        <div className="flex items-end gap-0.5 shrink-0 h-5">
                                            {[1, 0.6, 0.3].map((op, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 rounded-sm"
                                                    style={{
                                                        height: `${(i + 1) * 5 + 5}px`,
                                                        background: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                                                        opacity: preset.name === 'none' ? 0.2 : preset.name === 'reduced' && i === 2 ? 0.2 : op,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium leading-tight">{preset.label}</p>
                                            <p className="text-xs opacity-80 leading-tight mt-0.5">{preset.description}</p>
                                        </div>
                                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 ml-auto" style={{ color: 'var(--primary)' }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar Width */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Sidebar Width</p>
                        <div className="flex flex-wrap gap-2">
                            {sidebarWidths.map((preset) => {
                                const isActive = preferences.sidebarWidth === preset.name;
                                const barW = preset.name === 'compact' ? 8 : preset.name === 'wide' ? 16 : 12;
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => setSidebarWidth(preset.name)}
                                        title={preset.description}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded border px-3 py-2 text-left transition-all duration-150',
                                            isActive
                                                ? 'border-primary bg-card text-foreground'
                                                : 'border-border bg-card/50 text-muted-foreground hover:border-primary hover:text-foreground',
                                        )}
                                    >
                                        {/* Mini layout preview */}
                                        <div className="flex h-5 w-8 shrink-0 overflow-hidden rounded-sm border" style={{ borderColor: isActive ? 'var(--primary)' : 'var(--border)' }}>
                                            <div
                                                className="h-full shrink-0"
                                                style={{
                                                    width: `${barW}px`,
                                                    background: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                                                    opacity: 0.5,
                                                }}
                                            />
                                            <div className="flex-1" style={{ background: isActive ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--muted)' }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium leading-tight">{preset.label}</p>
                                            <p className="text-xs opacity-80 leading-tight mt-0.5">{preset.description}</p>
                                        </div>
                                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 ml-auto" style={{ color: 'var(--primary)' }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
