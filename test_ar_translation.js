const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const genAI = new GoogleGenerativeAI("AIzaSyASOU3G7XSCh-yxLWUQsxEGAEAr7hcSNHs");
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const generatedRaw = JSON.stringify({
        "seo_title": "Bixolon Barkod Yazıcı Fiyatları - Uygun Seçenekler",
        "seo_description": "En kaliteli ve uygun fiyatlı Bixolon barkod yazıcı modellerini keşfedin. İşletmenize özel etiketleme çözümleri ve endüstriyel baskı kalitesi sunan ürünlerimizi hemen inceleyin.",
        "keywords": "Bixolon barkod yazıcı, uygun fiyatlı barkod yazıcı, endüstriyel baskı makinesi",
        "description": "<h3>Bixolon Barkod Yazıcı Sistemleriyle Tanışın</h3><p>İşletmenizin tüm etiketleme ihtiyaçlarını karşılamak üzere tasarlanan <strong>Bixolon barkod yazıcı</strong> modelleri, endüstriyel baskı performansı uygun bütçelerle sunar.</p>"
    });

    const translatePrompt = `Aşağıdaki JSON verisindeki tüm metin değerlerini çevir. HTML yapılarını, JSON anahtarlarını (keys) ve etiketlerini hiçbir şekilde bozma. Sadece içeriği çevir.
Gelen Veri: ${generatedRaw}`;

    const systemPrompt = `You are a professional translator and SEO expert. Translate to Arabic (العربية). Output MUST BE valid JSON matching the input schema exactly. Do not add markdown blocks like \`\`\`json.`;

    try {
        console.log("Calling Gemini...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `System Instructions: ${systemPrompt}\n\nTask: ${translatePrompt}` }] }]
        });
        
        const rawText = result.response.text();
        console.log("RAW RESPONSE:");
        console.log(rawText);
        
        console.log("PARSED:");
        console.log(JSON.parse(rawText));
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
