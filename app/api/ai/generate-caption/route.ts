import { NextResponse } from "next/server";


import { createClient } from "@/utils/supabase/server";
import { callAIFallback } from "@/utils/ai";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { productName, productPrice, productFeatures } = await req.json();

        if (!productName) {
            return NextResponse.json({ error: "Ürün adı gerekli." }, { status: 400 });
        }

        const { data: settings } = await supabase.from("meta_settings").select("openai_api_key, gemini_api_key").single();

        if (!settings?.openai_api_key && !settings?.gemini_api_key && !(settings as any)?.xai_api_key) {
            return NextResponse.json({ error: "API anahtarı ayarlanmamış." }, { status: 400 });
        }

        const prompt = `Sen bir sosyal medya yöneticisisin. Aşağıdaki ürün için Instagram Gönderisi ve Hikayesi olarak kullanılacak ÇOK KISA, dikkat çekici, ve merak uyandıran maks 2 cümlelik bir metin yaz.
ÖNEMLİ KURALLAR:
1. Genel geçer ("özel fırsatlar" vb.) ifadeler YAZMA. Mutlaka ve özel olarak "${productName}" ürününden ve temel faydasından bahset. (Örn: "Termal etiket ihtiyaçlarınızda firmanıza özel çözümler sunuyoruz" vb.)
2. Kesinlikle "hemen sipariş verin", "satın alın", "kampanyayı kaçırmayın" gibi aciliyete veya doğrudan satışa yönelik ifadeler KULLANMA. 
3. Bunun yerine "arayın bilgi verelim", "detaylar için bizimle iletişime geçin", "ücretsiz danışın" gibi sadece kontak kurmaya (lead almaya) odaklı ifadeler kullan. Çıktıda tırnak işareti vb. olmasın.
4. Metnin en sonuna ürünle ve uzmanlık alanıyla (etiket, barkod, sanayi vb.) doğrudan ilgili, keşfete düşürtecek (viral) 3 ila 5 adet popüler #hashtag ekle. Kaliteli etiketler seç.
Ürün: ${productName}
Fiyat: ${productPrice ? productPrice + " TL" : "Belirtilmedi"}
Özellikler: ${productFeatures || "Genel"}
`;

        const rawText = await callAIFallback(
            "Sen uzman bir sosyal medya yöneticisisin.", 
            prompt, 
            false, 
            settings
        );
        let text = rawText || "";

        // Clean up quotes if AI included them despite instruction
        text = text.replace(/^["']|["']$/g, '').trim();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("AI Caption Gen Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate caption" }, { status: 500 });
    }
}
