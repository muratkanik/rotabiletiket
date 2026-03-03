import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // DALL-E 3 can take a bit

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { articleId, promptText } = body;

        if (!articleId || !promptText) {
            return NextResponse.json({ error: "Article ID and Prompt Text are required." }, { status: 400 });
        }

        const supabase = createAdminClient();
        if (!supabase) return NextResponse.json({ error: "Supabase Service Role Key missing." }, { status: 500 });

        // Fetch API Key from Settings
        const { data: settings } = await supabase
            .from('meta_settings')
            .select('openai_api_key')
            .single();

        if (!settings?.openai_api_key) {
            return NextResponse.json({ error: "Sistemde OpenAI API Key tanımlı değil." }, { status: 400 });
        }

        const openai = new OpenAI({ apiKey: settings.openai_api_key });

        const prompt = `Create a professional, high-quality, ultra-realistic cover image for a blog article about: "${promptText}". The image should be suitable for a B2B audience in the industrial printing or software industry, avoiding text on the image. It should be wide (16:9). Minimalistic, clean, and highly detailed.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024", // DALL-E 3 16:9 is not supported standard in v1 depending on account, 1024x1024 is safe. If tier allows, 1792x1024 is possible. Using 1024x1024 for safety.
            response_format: "url"
        });

        if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error("DALL-E did not return an image URL.");
        }

        const imageUrl = response.data[0].url;

        // Fetch the image from OpenAI servers
        const imageRes = await fetch(imageUrl);
        const imageBlob = await imageRes.blob();

        // Ensure it's roughly named unique
        const fileName = `ai-generated-${articleId}-${Date.now()}.png`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('article-images')
            .upload(fileName, imageBlob, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        // Update the database record
        const { error: updateError } = await supabase
            .from('articles')
            .update({ image_url: fileName })
            .eq('id', articleId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, image_url: fileName, full_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${fileName}` });

    } catch (error: any) {
        console.error("AI Image Generation Error:", error);
        return NextResponse.json({ error: error.message || "Bilinmeyen bir hata oluştu" }, { status: 500 });
    }
}
