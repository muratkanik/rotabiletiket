import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow 60 seconds execution for AI tasks on Vercel

function generateSlug(str: string) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { categoryId, mock } = body;

        if (!categoryId) {
            return NextResponse.json({ error: "Category ID eksik." }, { status: 400 });
        }

        const supabase = createAdminClient();
        if (!supabase) return NextResponse.json({ error: "Supabase Service Role Key eksik (Admin). Vercel değişkenlerini kontrol edin." }, { status: 500 });

        // Fetch category
        const { data: category, error: categoryError } = await supabase
            .from('categories')
            .select(`
                *,
                category_translations(*)
            `)
            .eq('id', categoryId)
            .single();

        if (categoryError || !category) {
            return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
        }
        
        const trTranslation = category.category_translations?.find((t: any) => t.language_code === 'tr') || {
            title: category.title,
            description: category.description || ""
        };

        // Fetch API Key from Settings
        const { data: settings } = await supabase
            .from('meta_settings')
            .select('openai_api_key, serper_api_key, gemini_api_key')
            .single();

        const hasOpenAI = !!settings?.openai_api_key;
        const hasGemini = !!settings?.gemini_api_key;

        if (!hasOpenAI && !hasGemini) {
            return NextResponse.json({ error: "Sistemde OpenAI veya Gemini API Key tanımlı değil. (Ayarlar > Entegrasyonlar)." }, { status: 400 });
        }

        let openai: OpenAI | null = null;
        if (hasOpenAI) openai = new OpenAI({ apiKey: settings.openai_api_key });

        let genAI: GoogleGenerativeAI | null = null;
        if (hasGemini) genAI = new GoogleGenerativeAI(settings.gemini_api_key);

        const callAI = async (systemPrompt: string, userPrompt: string, asJson = false) => {
            if (hasOpenAI && openai) {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: asJson ? { type: "json_object" } : undefined
                });
                return completion.choices[0]?.message.content;
            } else if (hasGemini && genAI) {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: { responseMimeType: asJson ? "application/json" : "text/plain" }
                });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: `System Instructions: ${systemPrompt}\n\nTask: ${userPrompt}` }] }]
                });
                return result.response.text();
            }
            throw new Error("No AI available");
        };

        let trSerpDataText = "GERÇEK ZAMANLI TÜRKÇE VERİ YOK.";
        let enSerpDataText = "GERÇEK ZAMANLI İNGİLİZCE VERİ YOK.";

        if (!mock) {
            if (!settings?.serper_api_key) {
                return NextResponse.json({ error: "Sistemde Serper.dev API Key tanımlı değil. (Ayarlar > Entegrasyonlar)." }, { status: 400 });
            }

            try {
                // 1. Translate Title to English for English SERP
                const englishTitleRaw = await callAI(
                    "You are a professional translator. Translate the given Turkish text to English. Return ONLY the translation, nothing else.",
                    trTranslation.title
                );
                const englishTitle = englishTitleRaw?.trim() || trTranslation.title;

                // 2. Fetch Helper Function
                const fetchSerp = async (query: string, gl: string, hl: string) => {
                    const res = await fetch("https://google.serper.dev/search", {
                        method: 'POST',
                        headers: {
                            'X-API-KEY': settings.serper_api_key,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ q: query, gl, hl, num: 10 }) // Top 10 results
                    });
                    if (res.ok) {
                        const json = await res.json();
                        if (json.organic && Array.isArray(json.organic)) {
                            return json.organic.map((o: any) => `Başlık/Title: ${o.title}\nÖzet/Snippet: ${o.snippet}`).join("\n\n");
                        }
                    }
                    return "Sonuç bulunamadı.";
                };

                // 3. Fetch both in parallel
                const [trSerp, enSerp] = await Promise.all([
                    fetchSerp(trTranslation.title, "tr", "tr"),
                    fetchSerp(englishTitle, "us", "en")
                ]);

                trSerpDataText = trSerp;
                enSerpDataText = enSerp;

            } catch (err) {
                console.error("Serper API Error:", err);
                trSerpDataText = "Serper API isteği başarısız oldu.";
                enSerpDataText = "Serper API isteği başarısız oldu.";
            }

        } else {
            trSerpDataText = "SEO Uyumlu uçak bileti ürün detay örneği...";
            enSerpDataText = "SEO Friendly flight ticket product details example...";
        }

        const systemPrompt = `
Sen uzman bir Kurumsal SEO İçerik Yöneticisi ve B2B Metin Yazarı'sın. 
Görevin, aşağıdaki Türkçe ve İngilizce SERP verilerini harmanlayıp kullanıcının mevcut "Kategori" açıklamasını inceleyerek;
En profesyonel, sektörel iş ortağı bulmaya ve lead (form/talep) toplamaya teşvik eden, % 100 özgün, güven verici ve kesinlikle 100 SEO skoruna sahip yeni bir Türkçe Kategori Açıklaması oluşturmaktır.

MUTLAKA UYMAN GEREKEN KATI SEO KURALLARI:
1. Anahtar Kelime(keywords): Virgülle ayrılmış 3 adet odak anahtar kelime belirle. İlk sıraya yazdığın kelime "Ana Anahtar Kelime" kabul edilecektir.
2. SEO Başlığı(seo_title): Kesinlikle 40 ile 60 karakter arasında olmalıdır. İLK anahtar kelimeyi mutlaka içinde barındırmalıdır. Profesyonel olmalıdır.
3. SEO Açıklaması(seo_description): Kesinlikle 130 ile 155 karakter arasında olmalıdır. İLK anahtar kelimeyi mutlaka içinde barındırmalıdır. B2B ve profesyonel bir vaat vermelidir.
4. Kategori Açıklaması(description): Kesinlikle 150 - 300 kelime arası olmalıdır. Güven verici bir giriş yap. B2B kurumsal dil kullan (örneğin işletmelere, fabrikalara hitap et). Alt başlıklar (h2, h3) veya paragraflar kullanarak iyi bir yapı oluştur ve ilk anahtar kelimeyi en az 2 kez kullan.

Çıktıyı kesinlikle geçerli bir JSON formatında ver. JSON şeması şöyledir:
{
    "seo_title": "40-60 karakter arası dikkat çekici kurumsal başlık (ilk kelimeyi içerir)",
    "seo_description": "130-155 karakter uzunluğunda özet açıklama meta (ilk kelimeyi içerir)",
    "keywords": "virgülle_kelime1, virgülle_kelime2, virgülle_kelime3",
    "description": "Full HTML kurumsal kategori açıklaması veya düz metin (150-300 kelime. B2B dili. İlk kelimeyi 2 kez içerir.)"
}
`;

        const userPrompt = `
Mevcut Kategori Başlığı: ${trTranslation.title || 'Belirtilmemiş'}

1) TÜRKÇE SERP Analizi Raporu(Türkiye'deki Rakiplerin Kategori Özeti):
${trSerpDataText}

2) İNGİLİZCE SERP Analizi Raporu(Global Rakiplerin Kategori Özeti):
${enSerpDataText}

Mevcut Kategorinin Eski Açıklaması:
${trTranslation.description || 'İçerik boş, sen sıfırdan yarat.'}

Yukarıdaki katı kurallara harfiyen uyarak, HTML formatında mükemmel bir Türkçe Kategori (B2B Hizmet) Açıklaması üret (JSON formatında geri dön).`;

        const generatedRaw = await callAI(systemPrompt, userPrompt, true);

        if (!generatedRaw) {
            return NextResponse.json({ error: "Yapay zeka yanıt oluşturamadı." }, { status: 500 });
        }

        const generatedContent = JSON.parse(generatedRaw);

        // Update the current language (Assuming TR is default/primary for this system)
        const trTitle = generatedContent.seo_title || trTranslation.title;
        const { error: trUpdateError } = await supabase
            .from('category_translations')
            .upsert({
                category_id: categoryId,
                language_code: 'tr',
                title: trTitle,
                slug: generateSlug(trTitle),
                description: generatedContent.description,
                seo_title: generatedContent.seo_title || trTranslation.title,
                seo_description: generatedContent.seo_description,
                keywords: generatedContent.keywords
            }, { onConflict: 'category_id,language_code' });

        if (trUpdateError) {
            console.error("Translation Update Error:", trUpdateError)
            return NextResponse.json({ error: "Türkçe veri kaydedilirken hata oluştu: " + trUpdateError.message, details: trUpdateError.details }, { status: 500 });
        }

        // Also update the description in the main categories table to ensure consistency if app relies on it
        await supabase.from('categories').update({
            slug: generateSlug(trTitle),
            description: generatedContent.description,
            seo_title: trTitle,
            seo_description: generatedContent.seo_description,
            keywords: generatedContent.keywords
        }).eq('id', categoryId);

        // Translate to other languages in parallel to avoid Vercel 60s timeout
        const targetLanguages = [
            { code: 'en', instruction: 'Translate to English' },
            { code: 'de', instruction: 'Translate to German (Deutsch)' },
            { code: 'fr', instruction: 'Translate to French (Français)' },
            { code: 'ar', instruction: 'Translate to Arabic (العربية)' }
        ];

        await Promise.all(targetLanguages.map(async (lang) => {
            const translatePrompt = `Aşağıdaki JSON verisindeki tüm metin değerlerini çevir. HTML yapılarını, JSON anahtarlarını (keys) ve etiketlerini hiçbir şekilde bozma. Sadece içeriği çevir.
Gelen Veri: ${generatedRaw} `;

            try {
                const langRaw = await callAI(
                    `You are a professional translator and SEO expert. ${lang.instruction}. Output MUST BE valid JSON matching the input schema exactly. Do not add markdown blocks like \`\`\`json.`,
                    translatePrompt,
                    true
                );
                if (langRaw) {
                    const langContent = JSON.parse(langRaw);
                    const langTitle = langContent.seo_title || langContent.title || generatedContent.seo_title;
                    await supabase.from('category_translations').upsert({
                        category_id: categoryId, 
                        language_code: lang.code,
                        title: langTitle,
                        slug: generateSlug(langTitle),
                        description: langContent.description,
                        seo_title: langContent.seo_title || langContent.title || generatedContent.seo_title,
                        seo_description: langContent.seo_description,
                        keywords: langContent.keywords
                    }, { onConflict: 'category_id,language_code' });
                }
            } catch (translErr) {
                console.error(`Translation failed for ${lang.code}`, translErr);
            }
        }));

        return NextResponse.json({
            success: true,
            message: "Kategori başarıyla AI tarafından geliştirildi ve veritabanına kaydedildi.",
            data: generatedContent
        });

    } catch (e: any) {
        console.error("AI Enhance FULL Error:", e.message, e.stack);
        return NextResponse.json({ error: "Kritik sunucu hatası: " + (e.message || "Bilinmiyor"), details: e.stack }, { status: 500 });
    }
}
