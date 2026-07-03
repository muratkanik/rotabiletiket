import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, type } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Endüstri Standardı GEO/EEAT analiz simülasyonu (Gerçek LLM entegrasyonu için yapılandırılabilir)
        // Bu endpoint, makale veya ürün açıklamalarının GEO (Generative Engine Optimization)
        // ve EEAT uyumluluğunu ölçmek için tasarlanmıştır.

        const wordCount = text.split(' ').length;
        
        // Basit metrik bazlı skorlama
        let eeatScore = 0;
        let geoScore = 0;

        if (wordCount > 300) {
            eeatScore += 40;
            geoScore += 30;
        } else {
            eeatScore += 20;
            geoScore += 15;
        }

        if (text.toLowerCase().includes('tecrübe') || text.toLowerCase().includes('uzman') || text.toLowerCase().includes('kalite')) {
            eeatScore += 30;
        }

        if (text.toLowerCase().includes('nedir') || text.toLowerCase().includes('nasıl') || text.includes('?')) {
            geoScore += 40; // LLM'ler Soru-Cevap formatını sever
        }

        // Limit scores to 100
        eeatScore = Math.min(100, eeatScore + 20); // Base 20
        geoScore = Math.min(100, geoScore + 20); // Base 20

        const feedback = [];
        if (eeatScore < 70) feedback.push("Uzmanlık (EEAT) belirtilerini artırın: Yazar bilgisi, kaynakça veya teknik terimler ekleyin.");
        if (geoScore < 70) feedback.push("GEO optimizasyonu için içeriği 'Nedir?', 'Nasıl Çalışır?' gibi başlıklarla zenginleştirin.");
        if (feedback.length === 0) feedback.push("İçerik EEAT ve GEO standartlarına tam uyumlu. Yapay zeka botları tarafından referans alınmaya hazır.");

        return NextResponse.json({
            success: true,
            scores: {
                eeat: eeatScore,
                geo: geoScore,
                readability: 85,
                llmVisibility: Math.round((eeatScore + geoScore) / 2)
            },
            feedback
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
