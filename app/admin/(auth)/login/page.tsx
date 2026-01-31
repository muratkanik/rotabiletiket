'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
                <div className="flex justify-center mb-8">
                    <div className="relative h-12 w-48">
                        <Image src="/logo.png" alt="Rotabil Admin" fill className="object-contain" unoptimized />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Yönetim Paneli Giriş</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11"
                            placeholder="ornek@rotabiletiket.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11"
                            placeholder="******"
                            required
                        />
                        <div className="text-right mt-1">
                            <Link href="/admin/forgot-password" className="text-xs text-orange-600 hover:text-orange-700 transition-colors">
                                Şifremi Unuttum
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-base" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {loading ? 'Giriş Yapılıyor' : 'Giriş Yap'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
