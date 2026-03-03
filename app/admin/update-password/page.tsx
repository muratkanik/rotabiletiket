'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function UpdatePasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [hasToken, setHasToken] = useState<boolean | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check if there is a session or a hash fragment containing the access token
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setHasToken(true);
            } else {
                // Supabase hash fragment automatically creates a session if valid
                const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
                        setHasToken(true);
                    }
                });

                // If after a short delay no session is established, consider it invalid
                setTimeout(() => {
                    setHasToken(prev => prev === null ? false : prev);
                }, 1500);

                return () => {
                    authListener.subscription.unsubscribe();
                }
            }
        };

        checkSession();
    }, [supabase]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor');
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast.error(error.message || 'Şifre güncellenemedi');
            setIsLoading(false);
        } else {
            setIsUpdated(true);
            toast.success('Şifre başarıyla güncellendi');
            setIsLoading(false);
        }
    }

    if (isUpdated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Şifre Güncellendi!</h1>
                    <p className="text-slate-500 mb-8">
                        Yeni şifrenizle giriş yapabilirsiniz.
                    </p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin/login">Giriş Yap</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-8">
                    <div className="relative w-48 h-12 mx-auto mb-6">
                        <Image
                            src="/logo.png"
                            alt="Rotabil Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Yeni Şifre Belirle</h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Lütfen hesabınız için yeni bir şifre girin.
                    </p>
                </div>

                {hasToken === false ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar sıfırlama talebinde bulunun.
                        </div>
                        <Button asChild variant="outline" className="w-full mt-4">
                            <Link href="/admin/forgot-password">Yeniden Talep Et</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                            <Input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="h-11"
                                disabled={hasToken === null}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre (Tekrar)</label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="h-11"
                                disabled={hasToken === null}
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700 font-medium" disabled={isLoading || hasToken === null}>
                            {isLoading || hasToken === null ? <Loader2 className="animate-spin mr-2" /> : null}
                            {hasToken === null ? 'Bağlantı Kontrol Ediliyor...' : 'Şifreyi Güncelle'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
