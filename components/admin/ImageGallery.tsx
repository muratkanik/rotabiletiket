'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, RefreshCw, Upload, Package, FolderTree, FileText } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageGalleryProps {
    defaultBucket?: string;
    onSelect?: (url: string) => void;
    className?: string;
}

const BUCKETS = [
    { id: 'product-images', name: 'Ürün Görselleri', icon: Package },
    { id: 'category-images', name: 'Kategori Görselleri', icon: FolderTree },
    { id: 'article-images', name: 'Makale Görselleri', icon: FileText },
];

export function ImageGallery({ defaultBucket = 'product-images', onSelect, className }: ImageGalleryProps) {
    const [activeBucket, setActiveBucket] = useState(defaultBucket);
    const [files, setFiles] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.storage.from(activeBucket).list('', {
                limit: 5000,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });
            if (error) throw error;
            
            // Filter out empty folder placeholder files like .emptyFolderPlaceholder
            const validFiles = data?.filter(f => f.name && !f.name.startsWith('.')).sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            }) || [];
            
            setFiles(validFiles);
        } catch (error: any) {
            console.error('Error fetching files:', error);
            toast.error('Dosyalar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [activeBucket, supabase]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const getPublicUrl = (fileName: string) => {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${activeBucket}/${fileName}`;
    };

    const handleDelete = async (fileName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase.storage.from(activeBucket).remove([fileName]);
            if (error) throw error;
            toast.success('Görsel silindi');
            fetchFiles();
        } catch (error: any) {
            toast.error('Silme başarısız');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(activeBucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;
            
            toast.success('Dosya yüklendi');
            fetchFiles();
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Yükleme başarısız');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className || ''}`}>
            {/* Header / Bucket Selector */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0">
                <TooltipProvider delayDuration={200}>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {BUCKETS.map(b => {
                            const Icon = b.icon;
                            return (
                                <Tooltip key={b.id}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={activeBucket === b.id ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => setActiveBucket(b.id)}
                                            className={`shrink-0 w-9 h-9 ${activeBucket === b.id ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{b.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                        <div className="relative w-40 sm:w-48 shrink-0">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Dosya adı ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 h-9 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={fetchFiles} disabled={loading} className="shrink-0 w-9 h-9 hidden sm:flex">
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Yenile</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <label className={`cursor-pointer shrink-0 flex items-center justify-center w-9 h-9 border rounded-md shadow-sm transition-colors ${uploading ? 'bg-slate-100 text-slate-400 cursor-wait border-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                                    {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                                </label>
                            </TooltipTrigger>
                            <TooltipContent><p>Yeni Görsel Yükle</p></TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Grid */}
            {(() => {
                const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
                
                if (loading && files.length === 0) {
                    return (
                        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    );
                }
                
                if (filteredFiles.length === 0) {
                    return (
                        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
                            {searchQuery ? <p>"{searchQuery}" aramasıyla eşleşen görsel bulunamadı.</p> : <p>Bu klasörde henüz görsel yok.</p>}
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto max-h-[600px] p-1">
                        {filteredFiles.map(file => {
                        const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);
                        const url = getPublicUrl(file.name);
                        return (
                            <div 
                                key={file.id || file.name}
                                onClick={() => onSelect && onSelect(url)}
                                className={`group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border transition-all ${onSelect ? 'cursor-pointer hover:border-orange-500 hover:ring-2 hover:ring-orange-500/20' : ''}`}
                            >
                                {isVideo ? (
                                    <video src={url} className="w-full h-full object-cover" />
                                ) : (
                                    <Image
                                        src={url}
                                        alt={file.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                                
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <button
                                    type="button"
                                    onClick={(e) => handleDelete(file.name, e)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all shadow-sm"
                                    title="Sil"
                                >
                                    <Trash2 size={14} />
                                </button>
                                
                                <div className="absolute bottom-0 left-0 w-full text-white text-[10px] p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {file.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
                );
            })()}
        </div>
    );
}
