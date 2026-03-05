import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { productName, productPrice, productFeatures } = await req.json();

        if (!productName) {
            return NextResponse.json({ error: "Ürün adı gerekli." }, { status: 400 });
        }

        const { data: settings } = await supabase.from("meta_settings").select("openai_api_key, gemini_api_key").single();

        const hasOpenAI = !!settings?.openai_api_key;
        const hasGemini = !!settings?.gemini_api_key;

        if (!hasOpenAI && !hasGemini) {
            return NextResponse.json({ error: "OpenAI veya Gemini API anahtarı ayarlanmamış." }, { status: 400 });
        }

        const prompt = `Sen bir sosyal medya yöneticisisin. Aşağıdaki ürün için Instagram Hikayesinde (Story) kullanılacak ÇOK KISA, dikkat çekici, ve viral potansiyeli yüksek 1 maksimum 2 cümlelik bir metin yaz.
ÖNEMLİ KURAL: Kesinlikle "hemen sipariş verin", "satın alın", "kampanyayı kaçırmayın" gibi aciliyete veya doğrudan satışa yönelik ifadeler KULLANMA. Bunun yerine "arayın bilgi verelim", "detaylar için bizimle iletişime geçin", "ücretsiz danışın" gibi sadece kontak kurmaya (lead almaya) odaklı ifadeler kullan. Çıktıda sadece metin olsun, tırnak işareti vb. olmasın.
Ürün: ${productName}
Fiyat: ${productPrice ? productPrice + " TL" : "Belirtilmedi"}
Özellikler: ${productFeatures || "Genel"}
`;

        let text = "";

        if (hasOpenAI) {
            const openai = new OpenAI({ apiKey: settings.openai_api_key });
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 100,
            });
            text = response.choices[0]?.message?.content?.trim() || "";
        } else if (hasGemini) {
            const genAI = new GoogleGenerativeAI(settings.gemini_api_key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            text = result.response.text()?.trim() || "";
        }

        // Clean up quotes if AI included them despite instruction
        text = text.replace(/^["']|["']$/g, '').trim();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("AI Caption Gen Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate caption" }, { status: 500 });
    }
}
