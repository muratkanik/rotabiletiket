import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0; // Never cache this route

// This is the Autonomous Brain that simulates finding a trending keyword
// and triggering the article generation endpoint automatically.
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Otonom İstihbarat: Veritabanından en az makalesi olan veya boş kategorileri bul
        const supabase = await createClient();
        const { data: categories } = await supabase.from('categories').select('id, title, slug');
        
        if (!categories || categories.length === 0) {
            return NextResponse.json({ message: 'Kategori bulunamadı, işlem iptal.' });
        }

        // Rastgele bir kategori seç (Gelecekte Google Trends API eklenebilir)
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        // Bu kategori için trend olabilecek bir soru / anahtar kelime üret
        const keywords = [
            `${randomCategory.title} Nedir ve Nasıl Kullanılır?`,
            `Endüstriyel ${randomCategory.title} Çözümleri`,
            `${randomCategory.title} Seçerken Dikkat Edilmesi Gerekenler`,
            `2026 ${randomCategory.title} Teknolojileri ve Trendleri`
        ];
        const selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];

        // 2. Aksiyon: Üretilen kelimeyi AI Makale üretecine gönder
        // Localhost veya production URL'ini belirle
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rotabiletiket.com';
        
        const response = await fetch(`${baseUrl}/api/ai/generate-article-from-keyword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keywords: selectedKeyword,
                generateImage: true,
                autoPublish: false
            }),
        });

        if (!response.ok) {
            throw new Error('AI Generation failed');
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            message: 'Otonom beyin yeni bir trend tespit etti ve makale üretimini başlattı.',
            targetKeyword: selectedKeyword,
            category: randomCategory.title,
            aiResult: result
        });

    } catch (error: any) {
        console.error('Autonomous Brain Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
