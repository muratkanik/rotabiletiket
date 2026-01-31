'use client';

import { useState } from 'react';
import { createUserWithPassword } from '@/app/admin/(dashboard)/users/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddUserForm() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const res = await createUserWithPassword(email, password);
            if (res.success) {
                toast.success('Kullanıcı başarıyla oluşturuldu');
                (document.getElementById('add-user-form') as HTMLFormElement)?.reset();
            } else {
                toast.error(res.error || 'Bir hata oluştu');
            }
        } catch (error) {
            toast.error('Beklenmeyen bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form id="add-user-form" action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                <Input name="email" type="email" placeholder="ornek@rotabiletiket.com" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                <Input name="password" type="password" placeholder="******" required minLength={6} />
                <p className="text-xs text-slate-400 mt-1">En az 6 karakter olmalı</p>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Kullanıcı Oluştur
            </Button>
        </form>
    );
}
