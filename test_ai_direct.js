const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config({ path: '.env.local' });

async function run() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: settings } = await supabase.from('meta_settings').select('*').single();

    const openai = new OpenAI({ apiKey: settings.openai_api_key });

    const systemPrompt = `Sen uzman bir Kurumsal SEO İçerik Yöneticisi ve B2B Metin Yazarı'sın.
Görevin, aşağıdaki Türkçe ve İngilizce SERP verilerini harmanlayıp kullanıcının mevcut "Kategori" açıklamasını inceleyerek;
En profesyonel, sektörel iş ortağı bulmaya ve lead (form/talep) toplamaya teşvik eden, % 100 özgün, güven verici ve kesinlikle 100 SEO skoruna sahip yeni bir Türkçe Kategori Açıklaması oluşturmaktır.

MUTLAKA UYMAN GEREKEN KATI SEO KURALLARI:
1. Anahtar Kelime(keywords): Virgülle ayrılmış 3 adet odak anahtar kelime belirle. İlk sıraya yazdığın kelime "Ana Anahtar Kelime" kabul edilecektir.
2. SEO Başlığı(seo_title): Kesinlikle 40 ile 60 karakter arasında olmalıdır. İLK anahtar kelimeyi mutlaka içinde barındırmalıdır. Profesyonel olmalıdır.
3. SEO Açıklaması(seo_description): Kesinlikle 130 ile 155 karakter arasında olmalıdır. İLK anahtar kelimeyi mutlaka içinde barındırmalıdır. B2B ve profesyonel bir vaat vermelidir.
4. Kategori Açıklaması(description): Kesinlikle 150 - 300 kelime arası olmalıdır. Güven verici bir giriş yap. B2B kurumsal dil kullan (örneğin işletmelere, fabrikalara hitap et). Alt başlıklar (h2, h3) veya paragraflar kullanarak iyi bir yapı oluştur ve ilk anahtar kelimeyi en az 2 kez kullan.

Çıktıyı kesinlikle geçerli bir JSON formatında ver. JSON şeması şöyledir:
{
    "seo_title": "40-60 karakter arası dikkat çekici kurumsal başlık (ilk kelimeyi içerir)",
    "seo_description": "130-155 karakter uzunluğunda özet açıklama meta (ilk kelimeyi içerir)",
    "keywords": "virgülle_kelime1, virgülle_kelime2, virgülle_kelime3",
    "description": "Full HTML kurumsal kategori açıklaması veya düz metin (150-300 kelime. B2B dili. İlk kelimeyi 2 kez içerir.)"
}`;

    const userPrompt = `Mevcut Kategori Başlığı: Tablet PC
1) TÜRKÇE SERP Analizi: Test veri 1
2) İNGİLİZCE SERP Analizi: Test veri 2
Mevcut Açıklama: İçerik boş, sen sıfırdan yarat.

Yukarıdaki katı kurallara harfiyen uyarak, HTML formatında mükemmel bir Türkçe Kategori (B2B Hizmet) Açıklaması üret (JSON formatında geri dön).`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
    });
    
    console.log(completion.choices[0].message.content);
}

run();
