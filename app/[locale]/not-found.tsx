'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-lg text-slate-600 mb-8">Sayfa bulunamadı / Page not found</p>
            <Button asChild>
                <Link href="/">Ana Sayfa / Home</Link>
            </Button>
        </div>
    );
}
