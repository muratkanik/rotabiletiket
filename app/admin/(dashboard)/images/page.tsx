'use client';

import { ImageGallery } from '@/components/admin/ImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';

export default function MediaLibraryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <ImageIcon className="text-orange-600" size={32} />
                    Medya Kütüphanesi
                </h1>
                <p className="text-slate-500 mt-2">
                    Tüm kategorilere, ürünlere ve makalelere ait görselleri buradan merkezi olarak yönetin.
                </p>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle>Bulut Dosyaları (Supabase Storage)</CardTitle>
                    <p className="text-sm text-slate-500">Yüklenen görselleri klasör (bucket) isimlerine göre filtreleyebilir ve yeni yükleme yapabilirsiniz.</p>
                </CardHeader>
                <CardContent>
                    <ImageGallery />
                </CardContent>
            </Card>
        </div>
    );
}
