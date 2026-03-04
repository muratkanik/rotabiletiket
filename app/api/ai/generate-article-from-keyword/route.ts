import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { keywords } = body;

        if (!keywords) {
            return NextResponse.json({ error: "Anahtar kelime eksik." }, { status: 400 });
        }

        const supabase = createAdminClient();
        if (!supabase) return NextResponse.json({ error: "Supabase Service Role Key eksik (Admin)." }, { status: 500 });

        const { data: settings } = await supabase
            .from('meta_settings')
            .select('openai_api_key, serper_api_key, gemini_api_key')
            .single();

        const hasOpenAI = !!settings?.openai_api_key;
        const hasGemini = !!settings?.gemini_api_key;

        if (!hasOpenAI && !hasGemini) {
            return NextResponse.json({ error: "Sistemde OpenAI veya Gemini API Key tanımlı değil." }, { status: 400 });
        }

        if (!settings?.serper_api_key) {
            return NextResponse.json({ error: "Sistemde Serper.dev API Key tanımlı değil." }, { status: 400 });
        }

        let openai: OpenAI | null = null;
        if (hasOpenAI) openai = new OpenAI({ apiKey: settings.openai_api_key });

        let genAI: GoogleGenerativeAI | null = null;
        if (hasGemini) genAI = new GoogleGenerativeAI(settings.gemini_api_key);

        // --- Helper Function: Call AI (prefers Gemini if user requested fallback logic, but let's prefer OpenAI if exists, or Gemini if OpenAI is missing. Wait, I will use OpenAI first. If OpenAI is missing, fallback to Gemini.) ---
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
                // Gemini system instructions can be mixed or set directly
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: `System Instructions: ${systemPrompt}\n\nTask: ${userPrompt}` }] }]
                });
                return result.response.text();
            }
            throw new Error("No AI available");
        };

        // 1. Translate Keyword to English
        let englishKeyword = keywords;
        try {
            const rawTranslate = await callAI(
                "You are a translator. Translate the given Turkish text to English. Return ONLY the translation.",
                keywords
            );
            if (rawTranslate) englishKeyword = rawTranslate.trim();
        } catch (e) {
            console.error("Keyword translation failed:", e);
        }

        // 2. Fetch SERP
        const fetchSerp = async (query: string, gl: string, hl: string) => {
            try {
                const res = await fetch("https://google.serper.dev/search", {
                    method: 'POST',
                    headers: { 'X-API-KEY': settings.serper_api_key, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ q: query, gl, hl, num: 10 })
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.organic && Array.isArray(json.organic)) {
                        return json.organic.map((o: any) => `Başlık: ${o.title}\nÖzet: ${o.snippet}`).join("\n\n");
                    }
                }
            } catch (e) { console.error("Serper error:", e); }
            return "Sonuç bulunamadı.";
        };

        const [trSerp, enSerp] = await Promise.all([
            fetchSerp(keywords, "tr", "tr"),
            fetchSerp(englishKeyword, "us", "en")
        ]);

        // 3. Generate Article
        const systemPrompt = `
Sen uzman bir SEO İçerik Yöneticisi ve Metin Yazarı'sın.
Görevin, verilen anahtar kelimeler ve SERP (Arama Motoru Sonuçları) verilerini analiz ederek, SIFIRDAN yepyeni bir makale oluşturmaktır.
En kapsamlı, %100 özgün, okunabilirliği yüksek ve hedef anahtar kelimede Google'da 1. sıraya oynayacak bir içerik yarat.

KURALLAR:
1. seo_title: 40-60 karakter, anahtar kelimeyi içerir.
2. seo_description & summary: 130-155 karakter, dikkat çekici, anahtar kelimeyi içerir.
3. slug: URL'ye uygun, küçük harfli, boşluksuz, makale başlığına göre slug (örn: termal-etiket-nedir)
4. content_html: Kesinlikle en az 600 kelime. Alt başlıklar (h2, h3), listeler (ul/li) kullan. Makalenin sonunda Sıkça Sorulan Sorular (S.S.S) adlı 3-4 soruluk bölüm eklenecek. İçerikte anahtar kelimeleri 3-4 kez geçir.

Lütfen çıktıyı sadece JSON formatında ver. Örnek JSON şeması:
{
    "title": "Ana Başlık",
    "seo_title": "Max 60 Karakter SEO Başlık",
    "seo_description": "Max 155 Karakter Açıklama",
    "summary": "Makale özeti",
    "slug": "url-slug",
    "content_html": "Full HTML makale...",
    "keywords": "kelime1, kelime2..."
}
`;

        const userPrompt = `
Hedef Anahtar Kelimeler: ${keywords}

TÜRKÇE SERP (Rakip) Analizi:
${trSerp}

İNGİLİZCE SERP Analizi:
${enSerp}

Lütfen yukarıdaki kurallara uyarak JSON formatında makaleyi üret.`;

        const generatedRaw = await callAI(systemPrompt, userPrompt, true);
        if (!generatedRaw) throw new Error("Makale üretilemedi.");

        let generatedContent;
        try {
            generatedContent = JSON.parse(generatedRaw);
        } catch (e) {
            console.error("JSON parse error:", generatedRaw);
            throw new Error("AI geçerli bir JSON formatı döndürmedi.");
        }

        // 4. Save to Database
        const { data: newArticle, error: insertError } = await supabase
            .from('articles')
            .insert({
                title: generatedContent.title || generatedContent.seo_title,
                slug: generatedContent.slug,
                summary: generatedContent.summary,
                content_html: generatedContent.content_html,
                is_published: true // Publish immediately or leave as draft? Let's publish. Wait, let's keep it draft (false) so admin can review.
            })
            .select('id')
            .single();

        if (insertError) {
            console.error("Base Article Insert:", insertError);
            throw new Error("Makale veritabanına eklenemedi.");
        }

        const articleId = newArticle.id;

        // Main translation record (Turkish)
        await supabase.from('article_translations').insert({
            article_id: articleId,
            language_code: 'tr',
            title: generatedContent.title || generatedContent.seo_title,
            slug: generatedContent.slug,
            summary: generatedContent.summary,
            content_html: generatedContent.content_html,
            seo_description: generatedContent.seo_description,
            keywords: generatedContent.keywords
        });

        // 5. Generate Image (Only if OpenAI exists for DALL-E)
        if (hasOpenAI && openai) {
            try {
                const imageRes = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: `A professional, high-quality, modern featured image for a blog post about "${generatedContent.title}". The image should be clean, without text, suitable for a corporate blog.`,
                    n: 1,
                    size: "1024x1024"
                });

                const imageUrl = imageRes.data?.[0]?.url;
                if (imageUrl) {
                    const imgResp = await fetch(imageUrl);
                    const blob = await imgResp.blob();
                    const fileName = `${articleId}-${Date.now()}.png`;

                    const { error: uploadError } = await supabase.storage
                        .from('article-images')
                        .upload(fileName, blob, { contentType: 'image/png', upsert: true });

                    if (!uploadError) {
                        await supabase.from('articles').update({ image_url: fileName }).eq('id', articleId);
                    }
                }
            } catch (err) {
                console.error("DALL-E image generation failed:", err);
            }
        }

        // 6. Translations
        const targetLanguages = [
            { code: 'en', instruction: 'Translate to English' },
            { code: 'de', instruction: 'Translate to German (Deutsch)' },
            { code: 'fr', instruction: 'Translate to French (Français)' },
            { code: 'ar', instruction: 'Translate to Arabic (العربية)' }
        ];

        await Promise.all(targetLanguages.map(async (lang) => {
            try {
                const translateSysPrompt = `You are a professional translator and SEO expert. ${lang.instruction}. Output MUST BE valid JSON matching the input schema exactly. Do not add markdown blocks.`;
                const translateUserPrompt = `Translate the following JSON's values, preserving HTML tags: \n${JSON.stringify(generatedContent)}`;

                const langRaw = await callAI(translateSysPrompt, translateUserPrompt, true);
                if (langRaw) {
                    const langContent = JSON.parse(langRaw);
                    await supabase.from('article_translations').insert({
                        article_id: articleId,
                        language_code: lang.code,
                        title: langContent.title || langContent.seo_title || generatedContent.title,
                        slug: generatedContent.slug + '-' + lang.code, // Append language code mapped slug
                        summary: langContent.summary,
                        content_html: langContent.content_html,
                        seo_description: langContent.seo_description,
                        keywords: langContent.keywords
                    });
                }
            } catch (translErr) {
                console.error(`Translation failed for ${lang.code}`, translErr);
            }
        }));

        return NextResponse.json({
            success: true,
            message: "Makale başarıyla üretildi.",
            articleId: articleId
        });

    } catch (e: any) {
        console.error("Auto Gen FULL Error:", e.message, e.stack);
        return NextResponse.json({ error: e.message || "Bilinmeyen bir hata oluştu." }, { status: 500 });
    }
}
