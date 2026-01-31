'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function AdminImagesPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchImages();
    }, []);

    async function fetchImages() {
        const { data, error } = await supabase.storage.from('product-images').list();
        if (data) {
            // Filter out folders and non-image files
            const imageFiles = data.filter(item => item.name !== '.emptyFolderPlaceholder' && item.name !== 'migrated' && item.metadata);
            setImages(imageFiles);
        }
        setLoading(false);
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);

        const file = e.target.files[0];
        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage.from('product-images').upload(fileName, file);

        if (error) {
            toast.error('Yükleme başarısız');
        } else {
            toast.success('Görsel yüklendi');
            fetchImages();
        }
        setUploading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Görsel Yönetimi</h1>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleUpload}
                        accept="image/*"
                    />
                    <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                        Görsel Yükle
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((file) => (
                        <div key={file.id} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border">
                            <Image
                                src={`https://zninvhkeicgkixhigufo.supabase.co/storage/v1/object/public/product-images/${file.name}`}
                                alt={file.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="destructive" size="icon" className="h-8 w-8">
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
