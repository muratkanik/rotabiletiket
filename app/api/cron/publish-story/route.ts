import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// export const maxDuration = 60; // Set max duration if running on Vercel Pro

export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Fetch Meta Settings
        const { data: settings, error: settingsError } = await supabase
            .from("meta_settings")
            .select("*")
            .single();

        if (settingsError || !settings) {
            console.error("Cron Error: Meta settings not found");
            return NextResponse.json({ error: "Meta settings not configured" }, { status: 400 });
        }

        const { system_user_access_token, instagram_business_account_id, openai_api_key, gemini_api_key } = settings;

        // 2. Query a random product or article
        // First, let's flip a coin: 0 for product, 1 for article
        const isProduct = Math.random() > 0.5;
        let itemRef = { title: "", price: "", image: "", description: "" };

        if (isProduct) {
            const { data: allIds } = await supabase.from("products").select("id");
            if (allIds && allIds.length > 0) {
                const randomId = allIds[Math.floor(Math.random() * allIds.length)].id;
                const { data: randomProduct } = await supabase
                    .from("products")
                    .select("title, price, storage_path, description")
                    .eq("id", randomId)
                    .single();

                if (randomProduct) {
                    // Determine image url
                    let imgUrl = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000";
                    if (randomProduct.storage_path) {
                        if (randomProduct.storage_path.startsWith('http')) {
                            imgUrl = randomProduct.storage_path;
                        } else if (randomProduct.storage_path.startsWith('/')) {
                            imgUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.rotabiletiket.com"}${randomProduct.storage_path}`;
                        } else {
                            imgUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${randomProduct.storage_path}`;
                        }
                    }
                    itemRef = {
                        title: randomProduct.title,
                        price: randomProduct.price ? String(randomProduct.price) : "",
                        image: imgUrl,
                        description: randomProduct.description || ""
                    };
                }
            }
        } else {
            const { data: allIds } = await supabase.from("articles").select("id");
            if (allIds && allIds.length > 0) {
                const randomId = allIds[Math.floor(Math.random() * allIds.length)].id;
                const { data: randomArticle } = await supabase
                    .from("articles")
                    .select("title, image_url, content_tr")
                    .eq("id", randomId)
                    .single();

                if (randomArticle) {
                    let imgUrl = randomArticle.image_url || "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=1000";
                    itemRef = {
                        title: randomArticle.title,
                        price: "",
                        image: imgUrl,
                        description: (randomArticle.content_tr || "").substring(0, 300)
                    };
                }
            }
        }

        // Fallback if both fails
        if (!itemRef.title) {
            itemRef = {
                title: "Özel Fırsat",
                price: "",
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000",
                description: "Stoklarla sınırlı harika içerikler."
            };
        }

        // 3. Generate AI Caption directly
        const prompt = `Sen bir sosyal medya yöneticisisin. Aşağıdaki içerik için Instagram Hikayesinde (Story) kullanılacak ÇOK KISA, dikkat çekici, FOMO (fırsatı kaçırma korkusu) yaratan ve viral potansiyeli yüksek 1 maksimum 2 cümlelik bir metin yaz. Başında sonunda tırnak olmasın.
İçerik Başlığı: ${itemRef.title}
Fiyat: ${itemRef.price ? itemRef.price + " TL" : "Belirtilmedi"}
Detaylar: ${itemRef.description}`;

        let caption = "Muhteşem bir fırsat! Hemen tıkla, detayları incele.";
        const hasOpenAI = !!openai_api_key;
        const hasGemini = !!gemini_api_key;

        try {
            if (hasOpenAI) {
                const { default: OpenAI } = await import("openai");
                const openai = new OpenAI({ apiKey: openai_api_key });
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 100,
                });
                caption = response.choices[0]?.message?.content?.trim() || caption;
            } else if (hasGemini) {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(gemini_api_key);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const result = await model.generateContent(prompt);
                caption = result.response.text()?.trim() || caption;
            }
            caption = caption.replace(/^["']|["']$/g, '').trim();
        } catch (err) {
            console.error("AI Generation failed in cron, using fallback caption.", err);
        }

        // 4. Generate the Vercel OG Image URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host")}` || "https://www.rotabiletiket.com";
        const ogParams = new URLSearchParams({
            title: itemRef.title,
            price: itemRef.price,
            image: itemRef.image,
            caption: caption
        });

        const storyImageUrl = `${baseUrl}/api/og/story?${ogParams.toString()}`;

        // 5. Publish to Meta as Instagram Story
        // Create Media Container for Story
        const containerUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media`;
        const containerFormData = new URLSearchParams({
            image_url: storyImageUrl,
            media_type: "STORIES", // CRITICAL FOR STORIES
            access_token: system_user_access_token,
        });

        const containerResponse = await fetch(containerUrl, {
            method: "POST",
            body: containerFormData,
        });

        const containerData = await containerResponse.json();

        if (containerData.error) {
            console.error("Meta API Container Error:", containerData.error);
            return NextResponse.json({ error: containerData.error.message }, { status: 500 });
        }

        const creationId = containerData.id;

        // Publish the Media Container
        const publishUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media_publish`;
        const publishFormData = new URLSearchParams({
            creation_id: creationId,
            access_token: system_user_access_token,
        });

        const publishResponse = await fetch(publishUrl, {
            method: "POST",
            body: publishFormData,
        });

        const publishData = await publishResponse.json();

        if (publishData.error) {
            console.error("Meta API Publishing Error:", publishData.error);
            return NextResponse.json({ error: publishData.error.message }, { status: 500 });
        }

        // 6. Log the scheduled post to Database
        await supabase.from("scheduled_posts").insert([{
            image_url: storyImageUrl,
            caption: caption,
            scheduled_for: new Date().toISOString(),
            status: "published",
            meta_post_id: publishData.id
        }]);

        return NextResponse.json({
            success: true,
            message: "Daily Story Published successfully!",
            meta_post_id: publishData.id,
            storyImageUrl,
            caption
        });

    } catch (error: any) {
        console.error("Story Cron Error:", error);
        return NextResponse.json({ error: error.message || "Failed to orchestrate Story publication" }, { status: 500 });
    }
}
