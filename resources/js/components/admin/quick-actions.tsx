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
                            background: 'linear-gradient(135deg, #408A71 0%, #285A48 100%)',
                            color: '#091413',
                            boxShadow: '0 2px 8px rgba(64,138,113,0.3)',
                        }
                        : {
                            background: 'transparent',
                            border: '1px solid #285A48',
                            color: '#7ABFA8',
                        }
                    }
                    onMouseEnter={e => {
                        if (action.primary) {
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(64,138,113,0.45)';
                        } else {
                            e.currentTarget.style.borderColor = '#408A71';
                            e.currentTarget.style.color = '#408A71';
                        }
                    }}
                    onMouseLeave={e => {
                        if (action.primary) {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(64,138,113,0.3)';
                        } else {
                            e.currentTarget.style.borderColor = '#285A48';
                            e.currentTarget.style.color = '#7ABFA8';
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
