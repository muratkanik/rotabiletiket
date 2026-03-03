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

        const { system_user_access_token, instagram_business_account_id, openai_api_key } = settings;

        // 2. Query a random product or featured product to post
        // For this example, let's assume there is a 'test' product since we are unsure of the schema.
        // In reality, this would query your exact products table.
        // Replace 'products' with your actual table name if different.
        const { data: randomProduct } = await supabase
            .from("products") // Update this table name if it differs!
            .select("title, price, image_url, id, description")
            .limit(1)
            .single();

        // Mock fallback product if table is empty or doesn't exist yet
        const product = randomProduct || {
            title: "Özel Fırsat Ürünü",
            price: 299,
            image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000",
            description: "Stoklarla sınırlı yüksek kaliteli ürün."
        };

        // 3. Generate AI Caption (Via internal API)
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host")}` || "http://localhost:3000";

        let caption = "Muhteşem bir ürün! Kaçırmak istemezsin.";
        if (openai_api_key) {
            try {
                const aiResponse = await fetch(`${baseUrl}/api/ai/generate-caption`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productName: product.title,
                        productPrice: product.price,
                        productFeatures: product.description
                    })
                });
                const aiData = await aiResponse.json();
                if (aiData.text) {
                    caption = aiData.text;
                }
            } catch (err) {
                console.error("AI Generation failed inline, using fallback caption.", err);
            }
        }

        // 4. Generate the Vercel OG Image URL
        // We encode parameters to pass them safely in the URL
        const ogParams = new URLSearchParams({
            title: product.title,
            price: product.price ? String(product.price) : "",
            image: product.image_url || "",
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
