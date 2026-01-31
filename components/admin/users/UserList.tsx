'use client';

import { deleteUser, sendPasswordReset } from '@/app/admin/(dashboard)/users/actions';
import { Button } from '@/components/ui/button';
import { Trash2, Key, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export function UserList({ initialUsers }: { initialUsers: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function handleDelete(userId: string) {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

        setLoadingId(userId);
        try {
            const res = await deleteUser(userId);
            if (res.success) {
                toast.success('Kullanıcı silindi');
            } else {
                toast.error(res.error || 'Silinemedi');
            }
        } finally {
            setLoadingId(null);
        }
    }

    async function handleReset(email: string) {
        if (!confirm(`${email} adresine şifre sıfırlama bağlantısı gönderilsin mi?`)) return;

        toast.info('Gönderiliyor...');
        try {
            const res = await sendPasswordReset(email);
            if (res.success) {
                toast.success('Şifre sıfırlama e-postası gönderildi');
            } else {
                toast.error(res.error || 'Gönderilemedi');
            }
        } catch (error) {
            toast.error('Hata oluştu');
        }
    }

    if (!initialUsers || initialUsers.length === 0) {
        return <div className="p-8 text-center text-slate-500">Hiç kullanıcı bulunamadı.</div>;
    }

    return (
        <div className="divide-y divide-slate-100">
            {initialUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{user.email}</p>
                            <p className="text-xs text-slate-500">
                                {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                {user.last_sign_in_at && ` • Son giriş: ${new Date(user.last_sign_in_at).toLocaleDateString('tr-TR')}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Şifre Sıfırla"
                            onClick={() => handleReset(user.email)}
                        >
                            <Key size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Sil"
                            disabled={loadingId === user.id}
                            onClick={() => handleDelete(user.id)}
                        >
                            {loadingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
