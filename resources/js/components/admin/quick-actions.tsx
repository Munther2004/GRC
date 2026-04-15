import {
    Plus,
    FileText,
    ClipboardList,
    AlertCircle,
    Upload,
    ShieldCheck,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const actions = [
    {
        label: 'New Risk',
        icon: Plus,
        variant: 'default' as const,
        href: '/risks/create',
    },
    {
        label: 'Start Assessment',
        icon: ClipboardList,
        variant: 'outline' as const,
        href: '/assessments/create',
    },
    {
        label: 'Upload Evidence',
        icon: Upload,
        variant: 'outline' as const,
        href: '/evidence/upload',
    },
    {
        label: 'Gap Analysis',
        icon: ShieldCheck,
        variant: 'outline' as const,
        href: '/assessments',
    },
    {
        label: 'Log Incident',
        icon: AlertCircle,
        variant: 'outline' as const,
        href: '/risks/create?type=incident',
    },
    {
        label: 'Generate Report',
        icon: FileText,
        variant: 'outline' as const,
        href: '/reports',
    },
];

export function QuickActions() {
    return (
        <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
                <Button
                    key={action.label}
                    variant={action.variant}
                    size="sm"
                    className={
                        action.variant === 'default'
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                            : ''
                    }
                    asChild
                >
                    <Link href={action.href}>
                        <action.icon className="mr-2 h-4 w-4" />
                        {action.label}
                    </Link>
                </Button>
            ))}
        </div>
    );
}
