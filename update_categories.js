const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
    // 1. Etiketler
    await supabase.from('categories').update({ display_order: 1 }).eq('id', 'efc9fff4-2dc4-40ef-9f5d-e2c2af66645f');
    // 2. Ribonlar
    await supabase.from('categories').update({ display_order: 2 }).eq('id', 'e9e84c51-7bb9-47fa-84e6-4c6b1694e196');
    // 3. Barkod Yazıcıları
    await supabase.from('categories').update({ display_order: 3 }).eq('id', 'b062235c-117d-4e9a-8dc3-5ccf398a260d');
    // 4. El Terminalleri
    await supabase.from('categories').update({ display_order: 4 }).eq('id', '54c4b3a0-fb64-4078-a968-a565e176eac1');
    // 5. Barkod Okuyucu
    await supabase.from('categories').update({ display_order: 5 }).eq('id', '9cbf2028-6447-451b-afb0-0ceb97942d66');
    // 6. Yedek Parça
    await supabase.from('categories').update({ display_order: 6 }).eq('id', '645b76e7-8cbe-46dc-960a-866c5289181e');
    // 7. Barkod Yazıcı Kafaları
    await supabase.from('categories').update({ display_order: 7 }).eq('id', '9bda65c4-422f-40a7-b96f-e4fc1557cb76');
    // 8. Sarf Malzemeler
    await supabase.from('categories').update({ display_order: 8 }).eq('id', 'c4ad4655-3f64-424a-aabc-c99d8c33af40');
    // 9. RFID Okuyucular
    await supabase.from('categories').update({ display_order: 9 }).eq('id', '86d3b11c-a063-482c-a19a-961be25f31ba');

    // For all those that are display_order 0, set to 50
    const { data: allCats } = await supabase.from('categories').select('id, display_order');
    for (let c of allCats) {
        if (c.display_order === 0) {
            await supabase.from('categories').update({ display_order: 50 }).eq('id', c.id);
        }
    }
    console.log("Done!");
}
test();
