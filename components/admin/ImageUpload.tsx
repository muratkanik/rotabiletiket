'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Library } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ImageGallery } from '@/components/admin/ImageGallery';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    bucket?: string;
    className?: string;
    accept?: string;
}

export function ImageUpload({
    value,
    onChange,
    onUploadStart,
    onUploadEnd,
    bucket = 'product-images', // Default bucket
    className,
    accept = "image/*"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            onUploadStart?.();

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Manually construct public URL to ensure consistency
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;

            onChange(publicUrl);
            toast.success('Dosya yüklendi');
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Yükleme başarısız');
        } finally {
            setUploading(false);
            onUploadEnd?.();
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    const handleSelectFromGallery = (url: string) => {
        onChange(url);
        setDialogOpen(false);
    };

    return (
        <div className={className}>
            {value ? (
                <div className="relative aspect-video w-full max-w-[300px] bg-slate-100 rounded-lg overflow-hidden border">
                    {/* Basic check for video file extensions */}
                    {value.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={value} className="w-full h-full object-cover" controls />
                    ) : (
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    )}

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                    >
                        <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs p-1 truncate px-2">
                        {value.split('/').pop()}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleUpload}
                                        accept={accept}
                                        disabled={uploading}
                                    />
                                    <div className={`flex items-center justify-center w-10 h-10 border rounded-md shadow-sm transition-colors
                                        ${uploading
                                            ? 'bg-slate-100 text-slate-400 cursor-wait'
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                                        }`}
                                    >
                                        {uploading ? (
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        ) : (
                                            <Upload className="h-4 w-4" />
                                        )}
                                    </div>
                                </label>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Bilgisayardan Dosya Yükle</p>
                            </TooltipContent>
                        </Tooltip>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" className="border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0">
                                            <Library className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Medya Kütüphanesinden Seç</p>
                                </TooltipContent>
                            </Tooltip>
                            
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Görsel Seç</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto mt-4 px-1">
                                <ImageGallery defaultBucket="product-images" onSelect={handleSelectFromGallery} />
                            </div>
                        </DialogContent>
                    </Dialog>
                    <span className="text-sm text-slate-500">Max 50MB</span>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
}
