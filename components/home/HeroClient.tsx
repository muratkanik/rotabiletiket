'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HeroClient({ settings }: { settings: any }) {
    return (
        <div className="max-w-3xl space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="inline-block px-3 py-1 rounded-full bg-orange-600/90 text-white text-sm font-medium mb-4">
                    {settings.badge_text}
                </span>
                <h1
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight"
                    dangerouslySetInnerHTML={{ __html: settings.title }} // Allow simple HTML like <br> and spans
                />
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed"
            >
                {settings.subtitle}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
            >
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 h-14" asChild>
                    <Link href={settings.cta_primary_link || '#'}>{settings.cta_primary_text}</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg px-8 h-14 backdrop-blur-sm" asChild>
                    <Link href={settings.cta_secondary_link || '#'}>{settings.cta_secondary_text}</Link>
                </Button>
            </motion.div>
        </div>
    );
}
