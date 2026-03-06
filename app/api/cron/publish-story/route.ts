import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
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
            const { data: allIds } = await supabase.from("products").select("id, product_images(id)");
            const validProducts = allIds ? allIds.filter((p: any) => p.product_images && p.product_images.length > 0) : [];
            if (validProducts.length > 0) {
                const randomId = validProducts[Math.floor(Math.random() * validProducts.length)].id;
                const { data: randomProduct } = await supabase
                    .from("products")
                    .select(`
                        title, 
                        price, 
                        description_html,
                        images:product_images(storage_path)
                    `)
                    .eq("id", randomId)
                    .single();

                if (randomProduct) {
                    const primaryImage = randomProduct.images && randomProduct.images.length > 0 ? randomProduct.images[0].storage_path : null;
                    // Determine image url
                    let imgUrl = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000";
                    if (primaryImage) {
                        if (primaryImage.startsWith('http')) {
                            imgUrl = primaryImage;
                        } else if (primaryImage.startsWith('/')) {
                            imgUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.rotabiletiket.com"}${primaryImage}`;
                        } else {
                            imgUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${primaryImage}`;
                        }
                    }
                    itemRef = {
                        title: randomProduct.title,
                        price: randomProduct.price ? String(randomProduct.price) : "",
                        image: imgUrl,
                        description: randomProduct.description_html?.replace(/<[^>]*>?/gm, '') || ""
                    };
                }
            }
        } else {
            const { data: allIds } = await supabase.from("articles").select("id").not("image_url", "is", null);
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
        const prompt = `Sen bir sosyal medya yöneticisisin. Aşağıdaki içerik için Instagram Gönderisi ve Hikayesinde kullanılacak ÇOK KISA, dikkat çekici, ve merak uyandıran maks 2 cümlelik bir metin yaz.
ÖNEMLİ KURALLAR:
1. Genel geçer ("özel fırsatlar" vb.) ifadeler YAZMA. Mutlaka ve özel olarak bağlamdaki üründen/konudan ("${itemRef.title}") ve temel değerinden bahset. (Örn: "Termal etiket ihtiyaçlarınızda firmanıza özel çözümler sunuyoruz" vb.)
2. Kesinlikle "hemen sipariş verin", "satın alın" gibi doğrudan satış ifadeleri KULLANMA. 
3. Bunun yerine "daha fazla bilgi için arayın", "detaylar için bizimle iletişime geçin", "uzmanlarımıza ücretsiz danışın" gibi sadece kontak kurma (lead alma) odaklı profesyonel bir çağrı yap. Tırnak içine alma.
İçerik Başlığı: ${itemRef.title}
Fiyat: ${itemRef.price ? itemRef.price + " TL" : "Belirtilmedi"}
Detaylar: ${itemRef.description}`;

        let caption = "Muhteşem bir fırsat! Hemen tıkla, detayları incele.";
        const hasOpenAI = !!openai_api_key;
        const hasGemini = !!gemini_api_key;

        let viralBackgroundImageUrl = itemRef.image; // Fallback to original image

        try {
            if (hasOpenAI) {
                const { default: OpenAI } = await import("openai");
                const openai = new OpenAI({ apiKey: openai_api_key });

                // 1. Generate Caption (Parallel with Image)
                const captionPromise = openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 100,
                }).then(res => res.choices[0]?.message?.content?.trim());

                // 2. Generate Viral Background (DALL-E 3)
                const imagePrompt = `A striking, viral, and modern Instagram story background related to: "${itemRef.title}". It should be highly aesthetic, professional, and captivating, with dramatic lighting. DO NOT include any text, letters, or words in the image. Just a clean, visually stunning background suitable for a tech, industrial or e-commerce story.`;
                const imagePromise = openai.images.generate({
                    model: "dall-e-3",
                    prompt: imagePrompt,
                    n: 1,
                    size: "1024x1024", // DALL-E 3 supports 1024x1792 but it might be slower/more expensive or unsupported in some API versions, let's stick to 1024x1024 and let OG cover/crop it, or request 1024x1792 if possible. Standard is 1024x1024 or 1024x1792. Let's try 1024x1792.
                }).catch(err => {
                    console.error("DALL-E 3 Error:", err);
                    return null;
                });

                // Await both
                const [captionResult, imageResult] = await Promise.all([captionPromise, imagePromise]);

                if (captionResult) caption = captionResult;
                if (imageResult && imageResult.data && imageResult.data.length > 0) {
                    viralBackgroundImageUrl = imageResult.data[0].url || itemRef.image;
                }

            } else if (hasGemini) {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(gemini_api_key);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const result = await model.generateContent(prompt);
                caption = result.response.text()?.trim() || caption;
            }
            caption = caption.replace(/^["']|["']$/g, '').trim();
        } catch (err) {
            console.error("AI Generation failed in cron, using fallback caption/image.", err);
        }

        // 4. Generate the Vercel OG Image URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host")}` || "https://www.rotabiletiket.com";
        const ogParams = new URLSearchParams({
            title: itemRef.title,
            price: itemRef.price,
            image: viralBackgroundImageUrl,
            caption: caption
        });

        // Facebook Graph API strictly requires JPEG images. Our /jpeg route converts it.
        const storyImageUrl = `${baseUrl}/api/og/story/jpeg/image.jpg?${ogParams.toString()}&ext=.jpg`;

        // 5. Upload to Supabase to get a clean, static URL for Meta
        let finalMetaImageUrl = storyImageUrl;
        try {
            const ogRes = await fetch(storyImageUrl);
            if (ogRes.ok) {
                const buffer = await ogRes.arrayBuffer();
                const fileName = `story_${Date.now()}.jpg`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(`stories/${fileName}`, buffer, { contentType: 'image/jpeg', upsert: true });

                if (!uploadError) {
                    finalMetaImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/stories/${fileName}`;
                } else {
                    console.error("Supabase story upload failed, falling back to dynamic URL", uploadError);
                }
            } else {
                console.error("Failed to fetch OG image", ogRes.status, ogRes.statusText);
            }
        } catch (e) {
            console.error("Failed to fetch and upload OG image, using dynamic URL", e);
        }

        // 6. Publish to Meta as Instagram Story and Feed Post
        const publishToInstagram = async (isStory: boolean) => {
            const containerUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media`;
            const params: Record<string, string> = {
                image_url: finalMetaImageUrl,
                access_token: system_user_access_token,
            };
            if (isStory) {
                params.media_type = "STORIES";
            } else {
                params.caption = caption; // Feed posts show caption
            }

            const containerFormData = new URLSearchParams(params);

            const containerResponse = await fetch(containerUrl, {
                method: "POST",
                body: containerFormData,
            });

            const containerData = await containerResponse.json();

            if (containerData.error) {
                console.error("Meta API Container Error:", containerData.error);
                throw new Error(`Meta Container Error (${isStory ? 'Story' : 'Post'}): ` + containerData.error.message);
            }

            const creationId = containerData.id;

            // --- Wait for the Container to be ready (FINISHED) ---
            let isReady = false;
            let attempts = 0;
            while (!isReady && attempts < 10) {
                await new Promise(r => setTimeout(r, 3000)); // wait 3 seconds
                const statusUrl = `https://graph.facebook.com/v21.0/${creationId}?fields=status_code&access_token=${system_user_access_token}`;
                const statusRes = await fetch(statusUrl);
                const statusData = await statusRes.json();
                if (statusData && statusData.status_code === "FINISHED") {
                    isReady = true;
                } else if (statusData && statusData.status_code === "ERROR") {
                    console.error("Meta Container Processing Error:", statusData);
                    throw new Error(`Meta rejected the image processing (${isStory ? 'Story' : 'Post'}).`);
                }
                attempts++;
            }

            if (!isReady) {
                throw new Error(`Media processing timeout by Meta (${isStory ? 'Story' : 'Post'}).`);
            }

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
                throw new Error(`Meta Publishing Error (${isStory ? 'Story' : 'Post'}): ` + publishData.error.message);
            }

            return publishData.id;
        };

        try {
            // Run both publish tasks in parallel
            const [storyPostId, feedPostId] = await Promise.all([
                publishToInstagram(true),  // Publish as Story
                publishToInstagram(false)  // Publish as Feed Post
            ]);

            // 7. Log the scheduled tasks to Database
            await supabase.from("scheduled_posts").insert([
                {
                    image_url: storyImageUrl,
                    caption: caption,
                    scheduled_for: new Date().toISOString(),
                    status: "published",
                    meta_post_id: storyPostId
                },
                {
                    image_url: storyImageUrl,
                    caption: caption,
                    scheduled_for: new Date().toISOString(),
                    status: "published",
                    meta_post_id: feedPostId
                }
            ]);

            return NextResponse.json({
                success: true,
                message: "Daily Story and Post published successfully!",
                story_post_id: storyPostId,
                feed_post_id: feedPostId,
                storyImageUrl,
                caption
            });
        } catch (error: any) {
            console.error("Publishing to Instagram failed:", error);
            return NextResponse.json({ error: error.message || "Failed to publish to Instagram" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Story Cron Error:", error);
        return NextResponse.json({ error: error.message || "Failed to orchestrate Story publication" }, { status: 500 });
    }
}
