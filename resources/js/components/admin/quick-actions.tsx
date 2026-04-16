import { Plus, FileText, ClipboardList, AlertCircle, Upload, ShieldCheck } from 'lucide-react';
import { Link } from '@inertiajs/react';

const actions = [
    { label: 'New Risk',         icon: Plus,         primary: true,  href: '/risks/create' },
    { label: 'Start Assessment', icon: ClipboardList, primary: false, href: '/assessments/create' },
    { label: 'Upload Evidence',  icon: Upload,        primary: false, href: '/evidence/upload' },
    { label: 'Gap Analysis',     icon: ShieldCheck,   primary: false, href: '/assessments' },
    { label: 'Log Incident',     icon: AlertCircle,   primary: false, href: '/risks/create?type=incident' },
    { label: 'Generate Report',  icon: FileText,      primary: false, href: '/reports' },
];

export function QuickActions() {
    return (
        <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
                <Link
                    key={action.label}
                    href={action.href}
                    className="inline-flex items-center gap-2 rounded px-4 py-2 font-display text-[10px] uppercase tracking-[0.15em] transition-all duration-200"
                    style={action.primary
                        ? {
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 35%, transparent)',
                        }
                        : {
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--muted-foreground)',
                        }
                    }
                    onMouseEnter={e => {
                        if (action.primary) {
                            e.currentTarget.style.filter = 'brightness(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 16px color-mix(in srgb, var(--primary) 45%, transparent)';
                        } else {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.color = 'var(--primary)';
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 6%, transparent)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (action.primary) {
                            e.currentTarget.style.filter = '';
                            e.currentTarget.style.boxShadow = '0 2px 8px color-mix(in srgb, var(--primary) 35%, transparent)';
                        } else {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--muted-foreground)';
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                >
                    <action.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    {action.label}
                </Link>
            ))}
        </div>
    );
}
