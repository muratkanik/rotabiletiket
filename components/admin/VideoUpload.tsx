'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Upload, X, PlayCircle, Youtube, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const supabase = createClient();

    const isYouTube = (url: string) => {
        return url.includes('youtube.com/') || url.includes('youtu.be/');
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return url;
    };

    const handleYouTubeSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!youtubeUrl.trim()) return;
        
        if (!isYouTube(youtubeUrl)) {
            toast.error('Geçerli bir YouTube linki giriniz.');
            return;
        }

        onChange(youtubeUrl.trim());
        setYoutubeUrl('');
        setShowUrlInput(false);
        toast.success('YouTube videosu eklendi');
    };

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
                    {isYouTube(value) ? (
                        <iframe
                            className="w-full h-full"
                            src={getYouTubeEmbedUrl(value)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <video 
                            src={value} 
                            className="w-full h-full object-contain" 
                            controls 
                            controlsList="nodownload" 
                        />
                    )}

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
                <div className="space-y-4">
                    {showUrlInput ? (
                        <form onSubmit={handleYouTubeSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-[400px]">
                            <div className="relative w-full">
                                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                                <Input
                                    type="text"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="pl-9 bg-white"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none">
                                    <Check className="h-4 w-4 mr-1" /> Ekle
                                </Button>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowUrlInput(false)} className="shrink-0">
                                    <X className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                                            <Upload className="mr-2 h-4 w-4 text-slate-500" />
                                            Dosya Yükle
                                        </>
                                    )}
                                </div>
                            </label>
                            
                            <div className="flex items-center gap-4">
                                <span className="text-slate-300 text-sm hidden sm:block">veya</span>
                                
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowUrlInput(true)}
                                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                                >
                                    <Youtube className="mr-2 h-4 w-4 text-red-500" />
                                    YouTube Linki
                                </Button>
                            </div>

                            <div className="flex flex-col ml-0 sm:ml-2">
                                <span className="text-xs text-slate-500 font-medium">MP4, WEBM (Max 50MB) veya YouTube Linki</span>
                                <span className="text-[10px] text-slate-400">Yatay (16:9) tavsiye edilir</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
