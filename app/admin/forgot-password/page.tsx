'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/update-password`,
        });

        if (error) {
            toast.error(error.message || 'Bir hata oluştu');
            setIsLoading(false);
        } else {
            setIsSent(true);
            toast.success('Şifre sıfırlama bağlantısı gönderildi');
            setIsLoading(false);
        }
    }

    if (isSent) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">E-posta Gönderildi!</h1>
                    <p className="text-slate-500 mb-8">
                        Şifrenizi sıfırlamak için e-posta adresinize gönderilen talimatları izleyin.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/login">Giriş sayfasına dön</Link>
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
                    <h1 className="text-2xl font-bold text-slate-800">Şifremi Unuttum</h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Hesabınıza ait e-posta adresini girin, size sıfırlama bağlantısı gönderelim.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="E-posta adresi"
                            required
                            className="h-11"
                        />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700 font-medium" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Sıfırlama Bağlantısı Gönder
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/admin/login" className="text-sm text-slate-600 hover:text-orange-600 flex items-center justify-center gap-2 transition-colors">
                        <ArrowLeft size={16} />
                        Giriş yap
                    </Link>
                </div>
            </div>
        </div>
    );
}
