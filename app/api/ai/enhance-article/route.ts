import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // Allow 60 seconds execution for AI tasks on Vercel

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { articleId, mock } = body;

        if (!articleId) {
            return NextResponse.json({ error: "Article ID eksik." }, { status: 400 });
        }

        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Supabase istemcisi oluşturulamadı." }, { status: 500 });

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
            .select('openai_api_key, serper_api_key')
            .single();

        if (!settings?.openai_api_key) {
            return NextResponse.json({ error: "Sistemde OpenAI API Key tanımlı değil. (Ayarlar > Entegrasyonlar)." }, { status: 400 });
        }

        const openai = new OpenAI({ apiKey: settings.openai_api_key });

        let serpDataText = "GERÇEK ZAMANLI VERİ YOK. MOCK MODU AKTİF.";

        if (!mock) {
            if (!settings?.serper_api_key) {
                return NextResponse.json({ error: "Sistemde Serper.dev API Key tanımlı değil. (Ayarlar > Entegrasyonlar)." }, { status: 400 });
            }

            try {
                const serpRes = await fetch("https://google.serper.dev/search", {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': settings.serper_api_key,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        q: article.title,
                        gl: "tr",
                        hl: "tr"
                    })
                });

                if (serpRes.ok) {
                    const serpJson = await serpRes.json();
                    if (serpJson.organic && Array.isArray(serpJson.organic)) {
                        serpDataText = serpJson.organic.map((o: any) => `Başlık: ${o.title}\nÖzet: ${o.snippet}`).join("\n\n");
                    } else {
                        serpDataText = "Arama sonucu bulunamadı.";
                    }
                } else {
                    console.error("Serper API error status:", serpRes.status);
                    serpDataText = "Serper API bağlantı hatası.";
                }
            } catch (err) {
                console.error("Serper API Error:", err);
                serpDataText = "Serper API isteği başarısız oldu.";
            }

        } else {
            serpDataText = "SEO Uyumlu uçak bileti blog yazısı örneği: Kullanıcıların en ucuz biletleri bulmak için Salı günleri arama yapması tavsiye edilir. Uçak bileti sitelerinde gizli sekme kullanmak algoritmayı kandırarak fiyatların artmasını engeller...";
        }

        const systemPrompt = `
Sen uzman bir SEO İçerik Yöneticisi ve Metin Yazarı'sın. 
Görevin, aşağıdaki SERP verisini(rakiplerin Google'da ne yazdığını) ve kullanıcının mevcut makalesini inceleyerek;
En kapsamlı, % 100 özgün(intihal içermeyen), okunabilirliği yüksek ve SEO skoru 100 olacak yeni bir içerik oluşturmaktır.

Çıktıyı kesinlikle geçerli bir JSON formatında ver.JSON şeması şöyledir:
                            {
                                "seo_title": "Max 60 karakter dikkat çekici başlık",
                                "seo_description": "Max 150 karakter özet açıklama meta",
                                "keywords": "virgülle ayrılmış 3-5 anahtar kelime",
                                "summary": "Makalenin kısa 2 cümlelik özeti",
                                "content_html": "Full HTML makale içeriği (h2, h3, p, ul kullanarak. Mevcut veriyi zenginleştir)"
                            }
                                `;

        const userPrompt = `
Mevcut Makale Başlığı: ${article.title}
SERP Analizi Raporu(Rakiplerin İçerik Özeti):
                            ${serpDataText}

Mevcut Makalenin Eski İçeriği:
                            ${article.content_html || 'İçerik boş, sen sıfırdan yarat.'}

Yukarıdakileri sentezle ve bana yepyeni, SERP verisiyle zenginleşmiş, HTML formatında mükemmel bir Türkçe Seo Blog içeriği üret(JSON formatında geri dön).`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost efficient model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const generatedRaw = completion.choices[0]?.message.content;

        if (!generatedRaw) {
            return NextResponse.json({ error: "Yapay zeka yanıt oluşturamadı." }, { status: 500 });
        }

        const generatedContent = JSON.parse(generatedRaw);

        // Update the current language (Assuming TR is default/primary for this system)
        const { error: trUpdateError } = await supabase
            .from('article_translations')
            .upsert({
                article_id: articleId,
                language_code: 'tr',
                title: generatedContent.seo_title || article.title,
                summary: generatedContent.summary,
                content_html: generatedContent.content_html,
                seo_description: generatedContent.seo_description,
                keywords: generatedContent.keywords
            }, { onConflict: 'article_id,language_code' });

        if (trUpdateError) {
            console.error("Translation Update Error:", trUpdateError)
            return NextResponse.json({ error: "Türkçe veri kaydedilirken hata oluştu." }, { status: 500 });
        }


        // (Optional) Here we can add a translation step to EN and AR right away
        const translatePrompt = `Çevirmen.Aşağıdaki HTML ve metinleri İngilizce'ye çevir. JSON formatını bozma.
Gelen Veri: ${generatedRaw}`;

        try {
            const enCompletion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "You are a professional translator and SEO expert. Translate to English. Output JSON." }, { role: "user", content: translatePrompt }],
                response_format: { type: "json_object" }
            });

            const enRaw = enCompletion.choices[0]?.message.content;
            if (enRaw) {
                const enContent = JSON.parse(enRaw);
                await supabase.from('article_translations').upsert({
                    article_id: articleId, language_code: 'en',
                    title: enContent.seo_title || enContent.title, summary: enContent.summary, content_html: enContent.content_html, seo_description: enContent.seo_description, keywords: enContent.keywords
                }, { onConflict: 'article_id,language_code' });
            }
        } catch (translErr) {
            console.error("EN Translation failed, skipping", translErr);
        }

        return NextResponse.json({
            success: true,
            message: "Makale başarıyla AI tarafından geliştirildi ve veritabanına kaydedildi.",
            data: generatedContent
        });

    } catch (e: any) {
        console.error("AI Enhance Error:", e);
        return NextResponse.json({ error: "Bir hata oluştu: " + e.message }, { status: 500 });
    }
}
