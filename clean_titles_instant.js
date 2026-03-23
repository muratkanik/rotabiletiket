const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('[*] Starting Title Cleanup...');

    const { data: categories } = await supabase.from('categories').select('id, title');
    let titleUpdates = 0;
    
    for (const cat of categories) {
        if (!cat.title) continue;
        
        let newTitle = cat.title;

        // Common SEO fluff to remove
        const fluff = [
            'Fiyatları - Barkod Yazıcı Modelleri',
            'Fiyatları - Yazıcı Modelleri',
            'Fiyatları - Barkod Modelleri',
            'Sarf Malzeme Fiyatları - Etiket Modelleri',
            'Fiyatları - Tablet Modelleri',
            'Fiyatları ',
            '- Barkod Yazıcı Modelleri',
            'Modelleri'
        ];

        for (const f of fluff) {
            newTitle = newTitle.replace(new RegExp(f, 'gi'), '').trim();
        }

        if (newTitle.toLowerCase().includes('el terminali modelleri')) {
            newTitle = newTitle.replace(/el terminali modelleri/i, 'El Terminalleri').trim();
        }
        
        newTitle = newTitle.replace(/El Terminali Fiyatları/i, '').trim();
        newTitle = newTitle.replace(/Barkod Okuyucu Fiyatları/i, '').trim();
        newTitle = newTitle.replace(/Barkod Yazıcı Fiyatları/i, '').trim();
        newTitle = newTitle.replace(/Tablet Fiyatları/i, '').trim();
        
        if (newTitle.endsWith('-')) newTitle = newTitle.slice(0, -1).trim();

        if (newTitle.endsWith('El Terminali') || newTitle.endsWith('El Terminalleri')) {
             newTitle = newTitle.replace(/El Terminali$/i, 'El Terminalleri');
        }

        newTitle = newTitle.replace(/\s+/g, ' ').trim();

        if (newTitle !== cat.title && newTitle.length > 2) {
            console.log(`Cleaning: "${cat.title}" -> "${newTitle}"`);
            await supabase.from('categories').update({ title: newTitle }).eq('id', cat.id);
            await supabase.from('category_translations').update({ title: newTitle }).eq('category_id', cat.id);
            titleUpdates++;
        }
    }
    console.log(`[*] Fixed ${titleUpdates} category titles.`);
    console.log('[*] DONE');
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
