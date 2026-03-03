import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { productName, productPrice, productFeatures } = await req.json();

        if (!productName) {
            return NextResponse.json({ error: "Ürün adı gerekli." }, { status: 400 });
        }

        const { data: settings } = await supabase.from("meta_settings").select("openai_api_key").single();

        if (!settings || !settings.openai_api_key) {
            return NextResponse.json({ error: "OpenAI API anahtarı ayarlanmamış." }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: settings.openai_api_key,
        });

        const prompt = `Sen bir sosyal medya yöneticisisin. Aşağıdaki ürün için Instagram Hikayesinde (Story) kullanılacak ÇOK KISA, dikkat çekici, FOMO (fırsatı kaçırma korkusu) yaratan ve viral potansiyeli yüksek 1 maksimum 2 cümlelik bir metin yaz. Çıktıda sadece metin olsun, tırnak işareti vb. olmasın.
Ürün: ${productName}
Fiyat: ${productPrice ? productPrice + " TL" : "Belirtilmedi"}
Özellikler: ${productFeatures || "Genel"}
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost effective model
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 100,
        });

        const text = response.choices[0]?.message?.content?.trim();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("AI Caption Gen Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate caption" }, { status: 500 });
    }
}
