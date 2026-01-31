import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Will need to create Badge

export function ProductCard({ product, categorySlug }: { product: any, categorySlug: string }) {
    // Use first image or placeholder
    const storagePath = product.product_images?.[0]?.storage_path;
    const imageUrl = storagePath
        ? (storagePath.startsWith('/') ? storagePath : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`)
        : '/placeholder-product.jpg';

    return (
        <Link
            href={`/urunler/${categorySlug}/${product.slug}`}
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative aspect-square w-full bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                </h3>
                {/* Simple description text extraction - could be better but ok for now */}
                <div
                    className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1"
                    dangerouslySetInnerHTML={{ __html: product.description_html?.substring(0, 150) + '...' || '' }}
                />

                <div className="mt-auto flex items-center text-sm font-medium text-blue-600 group-hover:text-orange-600">
                    İncele <ArrowRight className="ml-2 w-4 h-4" />
                </div>
            </div>
        </Link>
    );
}
