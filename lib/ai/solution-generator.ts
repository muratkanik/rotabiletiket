import { callAIFallback, AISettings } from '@/utils/ai';

export type SolutionGeneration = {
    base: Record<string, any>;
    de: Record<string, any>;
    en: Record<string, any>;
    serp: { tr: Array<{ title: string; link: string; snippet: string }>; en: Array<{ title: string; link: string; snippet: string }> };
};

async function searchSerp(query: string, gl: string, hl: string, key: string) {
    const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, gl, hl, num: 10 }),
    });
    if (!response.ok) throw new Error(`SERP isteği başarısız (${response.status}).`);
    const data = await response.json();
    return (data.organic || []).map((item: any) => ({
        title: String(item.title || ''), link: String(item.link || ''), snippet: String(item.snippet || ''),
    }));
}

export async function generateSolutionContent(keywords: string, settings: AISettings): Promise<SolutionGeneration> {
    if (!settings.openai_api_key && !process.env.OPENROUTER_API_KEY) throw new Error('AI API anahtarı tanımlı değil.');
    if (!settings.serper_api_key) throw new Error('Serper API anahtarı tanımlı değil.');
    const query = keywords.trim();
    if (!query) throw new Error('En az bir anahtar kelime girin.');
    const [tr, en] = await Promise.all([
        searchSerp(query, 'tr', 'tr', settings.serper_api_key),
        searchSerp(query, 'us', 'en', settings.serper_api_key),
    ]);
    const system = `Sen Rotabil Etiket için B2B teknik çözüm sayfaları üreten kıdemli SEO editörüsün. Rakip SERP verilerini yalnızca konu ve arama amacı analizi için kullan; rakip metinlerini kopyalama. UPM, rakip marka, doğrulanmamış sertifika, kapasite, müşteri veya teknik iddia uydurma. Bilinmeyenleri genel ve güvenli anlat. Her sayfa taslak olarak insan onayına gidecek. Geçerli JSON döndür.
Şema: {"base":{"title":"","slug":"","excerpt":"","content_html":"","technical_specs":{"Anahtar":"Değer"},"proof_points":[""],"seo_title":"","seo_description":"","keywords":""},"de":{"title":"","slug":"","excerpt":"","content_html":"","seo_title":"","seo_description":"","keywords":""},"en":{"title":"","slug":"","excerpt":"","content_html":"","seo_title":"","seo_description":"","keywords":""}}
Türkçe içerik 500-800 kelime, HTML içinde h2/h3/p/ul kullan. Almanca ve İngilizce aynı kapsamda doğal çeviri olsun. Sluglar Latin karakterli ve kısa olsun. Teknik özellikleri yalnızca verilen bağlamdan veya genel, koşullu ifadelerle yaz.`;
    const prompt = `Anahtar kelime/konu: ${query}
Türkiye SERP: ${JSON.stringify(tr)}
İngilizce SERP: ${JSON.stringify(en)}
Rotabil Etiket'in üretici ve uygulama danışmanı kimliğini koruyan özgün bir teknik çözüm sayfası oluştur. SERP kaynaklarından alıntı yapma ve kaynak URL'lerini içerik içine koyma.`;
    const raw = await callAIFallback(system, prompt, true, settings);
    if (!raw) throw new Error('Yapay zekâ içerik oluşturamadı.');
    const parsed = JSON.parse(raw);
    return { ...parsed, serp: { tr, en } };
}
