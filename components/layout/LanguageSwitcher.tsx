'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleLocaleChange = (newLocale: string) => {
        startTransition(() => {
            // Logic for path rewriting:
            // Current path: /en/urunler or /urunler (for default tr)
            // New path: /de/urunler

            let newPath = pathname;

            // If current path starts with current locale, remove it to get the base path
            // Note: 'tr' might not be in the path if it's default, but let's assume standard handling
            const segments = pathname.split('/');

            // If the first segment is a known locale, remove it
            if (['tr', 'en', 'de', 'fr', 'ar'].includes(segments[1])) {
                segments.splice(1, 1);
                newPath = segments.join('/');
            }

            // If new path is just empty or slash, make it empty string so we append properly
            if (newPath === '/') newPath = '';

            // Create the new URL
            // If newLocale is default (tr), we might want to omit it, but strict middleware usually handles this.
            // Easiest is to force the locale prefix if middleware requires it, or let middleware redirect.
            // Based on our middleware config, we support prefixing for all non-default? Or all?
            // Let's assume absolute path construction:

            const finalPath = `/${newLocale}${newPath}`;
            router.push(finalPath);
        });
    };

    const languages = [
        { code: 'tr', label: 'TR', name: 'Türkçe' },
        { code: 'en', label: 'EN', name: 'English' },
        { code: 'de', label: 'DE', name: 'Deutsch' },
        { code: 'fr', label: 'FR', name: 'Français' },
        { code: 'ar', label: 'AR', name: 'العربية' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 px-0" disabled={isPending}>
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Switch Language</span>
                    <span className="ml-1 text-xs font-bold">{locale.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLocaleChange(lang.code)}
                        className={`cursor-pointer ${locale === lang.code ? 'bg-slate-100 font-bold' : ''}`}
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
