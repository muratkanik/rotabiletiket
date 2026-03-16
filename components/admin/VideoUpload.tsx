'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Upload, X, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    bucket?: string;
    className?: string;
    accept?: string;
}

export function VideoUpload({
    value,
    onChange,
    onUploadStart,
    onUploadEnd,
    bucket = 'product-images', // Using the same bucket since it allows general media
    className,
    accept = "video/*"
}: VideoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            onUploadStart?.();

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `vid-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Manually construct public URL to ensure consistency
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;

            onChange(publicUrl);
            toast.success('Video yüklendi');
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Video yükleme başarısız');
        } finally {
            setUploading(false);
            onUploadEnd?.();
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={className}>
            {value ? (
                <div className="relative aspect-video w-full max-w-[400px] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-sm group">
                    <video 
                        src={value} 
                        className="w-full h-full object-contain" 
                        controls 
                        controlsList="nodownload" 
                    />

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-all shadow-md opacity-0 group-hover:opacity-100"
                        title="Videoyu Kaldır"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white/90 text-[10px] p-1 truncate px-2 pointer-events-none">
                        {value.split('/').pop()?.substring(0, 30)}...
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            accept={accept}
                            disabled={uploading}
                        />
                        <div className={`flex items-center justify-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-all
                            ${uploading
                                ? 'bg-slate-50 text-slate-400 cursor-wait border-slate-200'
                                : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 border-slate-300'
                            }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4 text-blue-500" />
                                    Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="mr-2 h-4 w-4 text-slate-500" />
                                    Video Seç
                                </>
                            )}
                        </div>
                    </label>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">MP4, WEBM (Max 50MB)</span>
                        <span className="text-[10px] text-slate-400">Yatay (16:9) tavsiye edilir</span>
                    </div>
                </div>
            )}
        </div>
    );
}
