import { Link } from '@inertiajs/react';
import { Plus, FileText, ClipboardList, AlertCircle, Upload, ShieldCheck } from 'lucide-react';

const actions = [
    { label: 'New risk',         icon: Plus,         primary: true,  href: '/risks/create' },
    { label: 'Start assessment', icon: ClipboardList, primary: false, href: '/assessments/create' },
    { label: 'Upload evidence',  icon: Upload,        primary: false, href: '/evidence/upload' },
    { label: 'Gap analysis',     icon: ShieldCheck,   primary: false, href: '/assessments' },
    { label: 'Log incident',     icon: AlertCircle,   primary: false, href: '/risks/create?type=incident' },
    { label: 'Generate report',  icon: FileText,      primary: false, href: '/reports' },
];

export function QuickActions() {
    return (
        <div className="flex flex-wrap gap-2.5">
            {actions.map((action) => (
                <Link
                    key={action.label}
                    href={action.href}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200"
                    style={action.primary
                        ? {
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            fontWeight: 500,
                            boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 28%, transparent)',
                        }
                        : {
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                        }
                    }
                    onMouseEnter={e => {
                        if (action.primary) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.filter = 'brightness(1.08)';
                        } else {
                            e.currentTarget.style.borderColor = 'var(--foreground)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (action.primary) {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.filter = '';
                        } else {
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }
                    }}
                >
                    <action.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                    {action.label}
                </Link>
            ))}
        </div>
    );
}
