import { Palette } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useFont } from '@/hooks/use-font';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function AppearanceMenu() {
    const { themeName, setTheme, themes } = useTheme();
    const { font, setFont, fonts } = useFont();

    const currentTheme = themes.find((t) => t.name === themeName);
    const currentFont = fonts.find((f) => f.name === font);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Appearance settings"
                >
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Appearance</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Themes */}
                <DropdownMenuLabel className="text-xs font-semibold uppercase">
                    Color Theme
                </DropdownMenuLabel>
                {themes.map((theme) => (
                    <DropdownMenuItem
                        key={theme.name}
                        onClick={() => setTheme(theme.name)}
                        className={cn(
                            'text-sm cursor-pointer',
                            themeName === theme.name && 'bg-accent',
                        )}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex gap-1">
                                {theme.preview.map((color, i) => (
                                    <div
                                        key={i}
                                        className="h-3 w-3 rounded-sm border border-white/20"
                                        style={{ background: color }}
                                    />
                                ))}
                            </div>
                            <span className="flex-1">{theme.label}</span>
                            {themeName === theme.name && (
                                <span className="text-xs">✓</span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {/* Fonts */}
                <DropdownMenuLabel className="text-xs font-semibold uppercase">
                    Font
                </DropdownMenuLabel>
                {fonts.map((fontConfig) => (
                    <DropdownMenuItem
                        key={fontConfig.name}
                        onClick={() => setFont(fontConfig.name)}
                        className={cn(
                            'text-sm cursor-pointer',
                            font === fontConfig.name && 'bg-accent',
                        )}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <span
                                className="flex-1"
                                style={{ fontFamily: fontConfig.stack }}
                            >
                                {fontConfig.label}
                            </span>
                            {font === fontConfig.name && (
                                <span className="text-xs">✓</span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
