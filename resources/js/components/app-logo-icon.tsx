import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = HTMLAttributes<HTMLSpanElement> & {
    alt?: string;
    /**
     * - `auto` (default): swap based on the document `dark` class.
     * - `dark`: always render the dark-mode logo (e.g. on a fixed dark surface).
     * - `light`: always render the light-mode logo (e.g. on a fixed light surface).
     */
    variant?: 'auto' | 'dark' | 'light';
};

export default function AppLogoIcon({
    className,
    alt = 'Logo',
    variant = 'auto',
    ...props
}: Props) {
    if (variant === 'dark') {
        return (
            <img
                {...(props as HTMLAttributes<HTMLImageElement>)}
                src="/logo-dark.png"
                alt={alt}
                className={cn('aspect-square shrink-0 object-contain', className)}
            />
        );
    }

    if (variant === 'light') {
        return (
            <img
                {...(props as HTMLAttributes<HTMLImageElement>)}
                src="/logo-light.png"
                alt={alt}
                className={cn('aspect-square shrink-0 object-contain', className)}
            />
        );
    }

    return (
        <span
            {...props}
            className={cn('relative inline-block aspect-square shrink-0', className)}
        >
            <img
                src="/logo-light.png"
                alt={alt}
                className="absolute inset-0 h-full w-full object-contain dark:hidden"
            />
            <img
                src="/logo-dark.png"
                alt={alt}
                className="absolute inset-0 hidden h-full w-full object-contain dark:block"
            />
        </span>
    );
}
