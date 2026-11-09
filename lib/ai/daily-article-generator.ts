import { callAIFallback, type AISettings } from '@/utils/ai';
import { calculateSeoScore } from './upm-monitor';

export type DailyArticleDraft = {
    title: string;
    seo_title: string;
    seo_description: string;
    summary: string;
    slug: string;
    content_html: string;
    keywords: string;
    topic?: string;
};

export type SerpResult = { title: string; link: string; snippet: string };

async function searchSerp(query: string, gl: string, hl: string, key: string): Promise<SerpResult[]> {
    const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, gl, hl, num: 10 }),
        signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`SERP isteği başarısız (${response.status}).`);
    const data = await response.json();
    return (data.organic || []).map((item: any) => ({ title: item.title, link: item.link, snippet: item.snippet }));
}

export async function generateDailyArticle(keyword: string, settings: AISettings) {
    if (!settings.serper_api_key) throw new Error('Serper API anahtarı tanımlı değil.');

    const [trSerp, enSerp] = await Promise.all([
        searchSerp(keyword, 'tr', 'tr', settings.serper_api_key),
        searchSerp(keyword, 'us', 'en', settings.serper_api_key),
    ]);

    const system = `Sen Rotabil Etiket için Almanya ve Avrupa pazarlarını hedefleyen kıdemli bir B2B SEO editörüsün. Rakip SERP sonuçlarını yalnızca arama amacı, içerik boşluğu ve başlık yapısı analizi için kullan; hiçbir metni kopyalama, kaynak URL'sini içerikte gösterme. Rotabil'in doğrulanmamış sertifika, müşteri, kapasite veya hukuki uygunluk iddiası yapmasına izin verme.
Makale Türkçe ve özgün olmalı. Teknik bilgileri açık, pratik ve güvenli biçimde anlat; gerektiğinde üretici/tedarikçi teknik dokümanının ve kullanım amacının doğrulanması gerektiğini belirt. Yalnızca geçerli JSON döndür.
Şema: {"topic":"","title":"","seo_title":"","seo_description":"","summary":"","slug":"","keywords":"","content_html":""}.
SEO kuralları: seo_title 40-60 karakter, seo_description 130-160 karakter, 700-1000 kelime, en az 5 h2/h3, ul listesi ve Sıkça Sorulan Sorular bölümü. HTML kullan, markdown kullanma.`;
    const prompt = `Hedef anahtar kelime: ${keyword}
Türkiye SERP rakip analizi:
${JSON.stringify(trSerp)}
İngilizce/Avrupa SERP rakip analizi:
${JSON.stringify(enSerp)}
Bu verilerden içerik boşluğunu belirle ve Rotabil Etiket'in etiket, ribon, barkod yazıcı ve teknik danışmanlık alanına uygun bir makale oluştur.`;

    const raw = await callAIFallback(system, prompt, true, settings);
    if (!raw) throw new Error('Günlük makale üretilemedi.');
    const article = JSON.parse(raw) as DailyArticleDraft;
    const seo = calculateSeoScore(article, keyword);
    return { article, seo, serp: { tr: trSerp, en: enSerp } };
}
