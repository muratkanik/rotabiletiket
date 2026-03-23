const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('[*] Starting Fuzzy Categorization');
    
    // Get the generic category ID
    const { data: catGeneric } = await supabase.from('categories').select('id').eq('slug', 'ice-aktarilan-urunler').single();
    if (!catGeneric) return console.log('Generic category not found');

    // Get uncategorized products
    const { data: prods } = await supabase.from('products').select('id, title').eq('category_id', catGeneric.id);
    console.log(`[*] Found ${prods.length} products to categorize by keyword.`);

    // Get all real categories
    const { data: allCats } = await supabase.from('categories').select('id, title');

    // Create a mapping dictionary to find best match ids
    const findCat = (keyword) => {
        const c = allCats.find(c => c.title.toLowerCase().includes(keyword.toLowerCase()));
        return c ? c.id : null;
    };

    const catMaps = {
        'elTerminali': findCat('el terminali modelleri') || findCat('el terminali'),
        'barkodYazici': findCat('barkod yazıcı modelleri') || findCat('barkod yazıcı'),
        'barkodOkuyucu': findCat('barkod modelleri') || findCat('barkod okuyucu'),
        'tablet': findCat('tablet modelleri') || findCat('tablet'),
        'yedekParca': findCat('yedek parça'),
        'sarf': findCat('etiket') || findCat('ribon') || findCat('sarf'),
        'hacim': findCat('hacim ölçerler')
    };

    let updatedCount = 0;

    for (const p of prods) {
        const titleLine = p.title.toLowerCase();
        let targetId = null;

        if (titleLine.includes('el terminal') || titleLine.includes('mobil bilgisayar')) {
            targetId = catMaps.elTerminali;
        } else if (titleLine.includes('barkod yazıcı') || titleLine.includes('yazici') || titleLine.includes('printer')) {
            targetId = catMaps.barkodYazici;
        } else if (titleLine.includes('barkod okuyucu') || titleLine.includes('tarayıcı') || titleLine.includes('scanner')) {
            targetId = catMaps.barkodOkuyucu;
        } else if (titleLine.includes('tablet')) {
            targetId = catMaps.tablet;
        } else if (titleLine.includes('kablo') || titleLine.includes('pil') || titleLine.includes('şarj') || titleLine.includes('batarya') || titleLine.includes('cradle') || titleLine.includes('adaptör') || titleLine.includes('kılıf') || titleLine.includes('aksesuar')) {
            targetId = catMaps.yedekParca || catMaps.sarf;
        } else if (titleLine.includes('etiket') || titleLine.includes('ribon')) {
            targetId = catMaps.sarf;
        } else if (titleLine.includes('ölçer') || titleLine.includes('cubiscan')) {
            targetId = catMaps.hacim;
        }

        if (targetId) {
            await supabase.from('products').update({ category_id: targetId }).eq('id', p.id);
            updatedCount++;
        }
    }

    console.log(`[*] Successfully fuzzy-mapped ${updatedCount} products.`);
    console.log('[*] DONE');
}

run();
