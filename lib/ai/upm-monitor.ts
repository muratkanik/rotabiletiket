import { createHash } from 'crypto';
import { callAIFallback, AISettings } from '@/utils/ai';

export const UPM_WATCH_SOURCES = [
    'https://www.labelmaterials.upm.com/products-and-services/product-safety-and-compliance/food-safe-labeling/',
    'https://www.labelmaterials.upm.com/products-and-services/product-safety-and-compliance/food-safe-labeling/food-safety-legislation-for-europe/',
    'https://www.labelmaterials.upm.com/products-and-services/product-safety-and-compliance/food-safe-labeling/food-safety-legislation-for-the-usa/',
    'https://www.labelmaterials.upm.com/products-and-services/product-safety-and-compliance/management-system-certificates-and-policies/',
    'https://www.labelmaterials.upm.com/news-and-stories/news/',
];

export type UPMWatch = { fingerprint: string; sources: Array<{ url: string; title: string; text: string }> };

function cleanHtml(html: string) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

export async function readUPMSources(): Promise<UPMWatch> {
    const sources = await Promise.all(UPM_WATCH_SOURCES.map(async (url) => {
        const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'RotabilEtiket-UPM-Monitor/1.0' } });
        if (!response.ok) throw new Error(`UPM kaynağı okunamadı (${response.status}): ${url}`);
        const text = cleanHtml(await response.text()).slice(0, 16000);
        return { url, title: new URL(url).pathname.split('/').filter(Boolean).pop() || 'UPM kaynak sayfası', text };
    }));
    const fingerprint = createHash('sha256').update(sources.map((source) => `${source.url}\n${source.text}`).join('\n')).digest('hex');
    return { fingerprint, sources };
}

async function searchSerp(query: string, gl: string, hl: string, key: string) {
    const response = await fetch('https://google.serper.dev/search', {
        method: 'POST', headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: query, gl, hl, num: 10 }),
    });
    if (!response.ok) throw new Error(`SERP isteği başarısız (${response.status}).`);
    const data = await response.json();
    return (data.organic || []).map((item: any) => ({ title: item.title, link: item.link, snippet: item.snippet }));
}

export function calculateSeoScore(content: Record<string, any>, keyword: string) {
    const html = String(content.content_html || '');
    const plain = html.replace(/<[^>]+>/g, ' ');
    const title = String(content.seo_title || '');
    const description = String(content.seo_description || '');
    const primary = keyword.toLocaleLowerCase('tr-TR');
    const checks = {
        titleLength: title.length >= 40 && title.length <= 60,
        descriptionLength: description.length >= 130 && description.length <= 160,
        keywordInTitle: title.toLocaleLowerCase('tr-TR').includes(primary),
        keywordInDescription: description.toLocaleLowerCase('tr-TR').includes(primary),
        keywordInContent: plain.toLocaleLowerCase('tr-TR').includes(primary),
        hasHeadings: /<h[23][^>]*>/i.test(html),
        hasList: /<ul[^>]*>/i.test(html),
        sufficientContent: plain.trim().split(/\s+/).length >= 500,
        hasFaq: /sıkça|faq|frequently asked/i.test(plain),
        validSlug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(content.slug || '')),
    };
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
    return { score, checks, wordCount: plain.trim().split(/\s+/).filter(Boolean).length };
}

export async function generateUPMArticle(keyword: string, watch: UPMWatch, settings: AISettings) {
    if (!settings.serper_api_key) throw new Error('Serper API anahtarı tanımlı değil.');
    const [trSerp, enSerp] = await Promise.all([searchSerp(keyword, 'tr', 'tr', settings.serper_api_key), searchSerp(keyword, 'us', 'en', settings.serper_api_key)]);
    const context = watch.sources.map((source) => `KAYNAK: ${source.url}\n${source.text}`).join('\n\n');
    const system = `Sen Rotabil Etiket'in mevzuat ve teknik içerik editörüsün. UPM Adhesive Materials'ın resmi kaynaklarından elde edilen güncel değişiklikleri analiz ederek Türkçe bir bilgi bankası makalesi üret. UPM adını kaynak bağlamında anabilirsin ama Rotabil Etiket'i UPM'nin temsilcisi gibi gösterme. UPM metinlerini kopyalama; yalnızca doğrulanabilir bilgileri özgün biçimde özetle. Hukuki danışmanlık, kesin uygunluk veya sertifika iddiası verme; intended use, güncel DoC ve uzman doğrulaması gerektiğini açıkça belirt.
Yalnızca geçerli JSON döndür: {"topic":"","title":"","seo_title":"","seo_description":"","summary":"","slug":"","keywords":"","content_html":"","source_note":""}.
SEO: seo_title 40-60 karakter, seo_description 130-155 karakter, 500-800 kelime, en az 5 h2/h3, ul listesi ve Sıkça Sorulan Sorular bölümü. İçerik özgün, teknik ve B2B olsun.`;
    const prompt = `İzlenen konu adayları: ${keyword}\nUPM resmi kaynak içerikleri:\n${context}\nTürkçe SERP:\n${JSON.stringify(trSerp)}\nİngilizce SERP:\n${JSON.stringify(enSerp)}\nBu verilerden gerçekten yeni veya güncellenmiş bir mevzuat/gıda uygulaması/ürün güvenliği konusu belirle ve makaleyi üret.`;
    const raw = await callAIFallback(system, prompt, true, settings);
    if (!raw) throw new Error('UPM makalesi üretilemedi.');
    const article = JSON.parse(raw);
    return { article, seo: calculateSeoScore(article, keyword), serp: { tr: trSerp, en: enSerp } };
}
