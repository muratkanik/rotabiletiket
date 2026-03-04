import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow 60 seconds execution for AI tasks on Vercel

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { articleId, mock } = body;

        if (!articleId) {
            return NextResponse.json({ error: "Article ID eksik." }, { status: 400 });
        }

        const supabase = createAdminClient();
        if (!supabase) return NextResponse.json({ error: "Supabase Service Role Key eksik (Admin). Vercel değişkenlerini kontrol edin." }, { status: 500 });

        // Fetch article
        const { data: article, error: articleError } = await supabase
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .single();

        if (articleError || !article) {
            return NextResponse.json({ error: "Makale bulunamadı." }, { status: 404 });
        }

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
                    article.title
                );
                const englishTitle = englishTitleRaw?.trim() || article.title;

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
                    fetchSerp(article.title, "tr", "tr"),
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
            trSerpDataText = "SEO Uyumlu uçak bileti blog yazısı örneği...";
            enSerpDataText = "SEO Friendly flight ticket blog post example...";
        }

        const systemPrompt = `
Sen uzman bir SEO İçerik Yöneticisi ve Metin Yazarı'sın. 
Görevin, aşağıdaki Türkçe ve İngilizce SERP verilerini (dünya genelindeki rakiplerin Google'da ne yazdığını) harmanlayıp kullanıcının mevcut makalesini inceleyerek;
En kapsamlı, % 100 özgün(intihal içermeyen), okunabilirliği yüksek ve kesinlikle 100 SEO skoruna sahip yeni bir Türkçe içerik oluşturmaktır.

MUTLAKA UYMAN GEREKEN KATI SEO KURALLARI:
1. Anahtar Kelime (keywords): Virgülle ayrılmış 3 adet odak anahtar kelime belirle. İlk sıraya yazdığın kelime "Ana Anahtar Kelime" kabul edilecektir.
2. SEO Başlığı (seo_title): Kesinlikle 40 ile 60 karakter arasında olmalıdır. İLK anahtar kelimeyi mutlaka içinde barındırmalıdır.
3. SEO Açıklaması / Özet (summary ve seo_description): İkisi de aynı olabilir. Kesinlikle 130 ile 155 karakter arasında olmalıdır. İLK anahtar kelimeyi mutlaka içinde barındırmalıdır.
4. İçerik Uzunluğu (content_html): Kesinlikle 500-600 kelime uzunluğunda, çok daha derin ve detaylı bir makale olmalıdır. Makalede en az 5-6 alt başlık bulunmalı ve her başlığın altına 2-3 uzun paragraf yazılmalıdır. İngilizce SERP'ten aldığın değerli bilgileri Türkçe içeriğe kaynaştırarak kaliteyi artır.
5. İçerik İçi Kelime Dağılımı: İLK anahtar kelime, makale metninin içinde (content_html) doğal bir akışla en az 3-4 defa geçmelidir.

Çıktıyı kesinlikle geçerli bir JSON formatında ver.JSON şeması şöyledir:
                            {
                                "seo_title": "40-60 karakter arası dikkat çekici başlık (ilk kelimeyi içerir)",
                                "seo_description": "130-155 karakter uzunluğunda özet açıklama meta (ilk kelimeyi içerir)",
                                "keywords": "virgülle_kelime1, virgülle_kelime2, virgülle_kelime3",
                                "summary": "130-155 karakter uzunluğunda özet (ilk kelimeyi içerir)",
                                "content_html": "Full HTML makale içeriği (h2, h3, p, ul kullanarak. 500-600 kelimeyi bulacak şekilde çok uzun paragraflar yaz. İlk anahtar kelimeyi 3-4 kez kullan. EN SONUNDA konuyla ilgili Sıkça Sorulan Sorular (S.S.S) adlı 3-4 soruluk bir bölüm ekle.)"
                            }
                                `;

        const userPrompt = `
Mevcut Makale Başlığı: ${article.title}

1) TÜRKÇE SERP Analizi Raporu(Türkiye'deki Rakiplerin İçerik Özeti):
${trSerpDataText}

2) İNGİLİZCE SERP Analizi Raporu (Global Rakiplerin İçerik Özeti):
${enSerpDataText}

Mevcut Makalenin Eski İçeriği:
${article.content_html || 'İçerik boş, sen sıfırdan yarat.'}

Yukarıdaki katı kurallara (özellikle karakter/kelime sınırları ve keyword yerleşimi) harfiyen uyarak, hem Türkiye hem de Global verileri harmanlayıp HTML formatında mükemmel bir Türkçe Seo Blog içeriği üret (JSON formatında geri dön). Makalenin en sonuna konuyla ilgili 3-4 adet Sıkça Sorulan Sorular (S.S.S) ve cevaplarını HTML formatında eklemeyi unutma.`;

        const generatedRaw = await callAI(systemPrompt, userPrompt, true);

        if (!generatedRaw) {
            return NextResponse.json({ error: "Yapay zeka yanıt oluşturamadı." }, { status: 500 });
        }

        const generatedContent = JSON.parse(generatedRaw);

        // Update the base article table for default TR view
        const { error: baseUpdateError } = await supabase
            .from('articles')
            .update({
                title: generatedContent.seo_title || article.title,
                summary: generatedContent.summary,
                content_html: generatedContent.content_html
            })
            .eq('id', articleId);

        if (baseUpdateError) {
            console.error("Base Article Update Error:", baseUpdateError)
            return NextResponse.json({ error: "Ana makale güncellenirken hata oluştu: " + baseUpdateError.message }, { status: 500 });
        }

        // Update the current language (Assuming TR is default/primary for this system)
        const { error: trUpdateError } = await supabase
            .from('article_translations')
            .upsert({
                article_id: articleId,
                language_code: 'tr',
                title: generatedContent.seo_title || article.title,
                slug: article.slug,
                summary: generatedContent.summary,
                content_html: generatedContent.content_html,
                seo_description: generatedContent.seo_description,
                keywords: generatedContent.keywords
            }, { onConflict: 'article_id,language_code' });

        if (trUpdateError) {
            console.error("Translation Update Error:", trUpdateError)
            return NextResponse.json({ error: "Türkçe veri kaydedilirken hata oluştu: " + trUpdateError.message, details: trUpdateError.details }, { status: 500 });
        }


        // Translate to other languages in parallel to avoid Vercel 60s timeout
        const targetLanguages = [
            { code: 'en', instruction: 'Translate to English' },
            { code: 'de', instruction: 'Translate to German (Deutsch)' },
            { code: 'fr', instruction: 'Translate to French (Français)' },
            { code: 'ar', instruction: 'Translate to Arabic (العربية)' }
        ];

        await Promise.all(targetLanguages.map(async (lang) => {
            const translatePrompt = `Aşağıdaki JSON verisindeki tüm metin değerlerini çevir. HTML yapılarını, JSON anahtarlarını (keys) ve etiketlerini hiçbir şekilde bozma. Sadece içeriği çevir.
Gelen Veri: ${generatedRaw}`;

            try {
                const langRaw = await callAI(
                    `You are a professional translator and SEO expert. ${lang.instruction}. Output MUST BE valid JSON matching the input schema exactly. Do not add markdown blocks like \`\`\`json.`,
                    translatePrompt,
                    true
                );
                if (langRaw) {
                    const langContent = JSON.parse(langRaw);
                    await supabase.from('article_translations').upsert({
                        article_id: articleId, language_code: lang.code,
                        title: langContent.seo_title || langContent.title || article.title,
                        slug: article.slug,
                        summary: langContent.summary,
                        content_html: langContent.content_html,
                        seo_description: langContent.seo_description,
                        keywords: langContent.keywords
                    }, { onConflict: 'article_id,language_code' });
                }
            } catch (translErr) {
                console.error(`Translation failed for ${lang.code}`, translErr);
            }
        }));

        return NextResponse.json({
            success: true,
            message: "Makale başarıyla AI tarafından geliştirildi ve veritabanına kaydedildi.",
            data: generatedContent
        });

    } catch (e: any) {
        console.error("AI Enhance FULL Error:", e.message, e.stack);
        return NextResponse.json({ error: "Kritik sunucu hatası: " + (e.message || "Bilinmiyor"), details: e.stack }, { status: 500 });
    }
}
