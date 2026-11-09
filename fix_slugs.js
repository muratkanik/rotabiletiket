const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function trSlugify(title) {
    const trMap = {
        'çÇ':'c',
        'ğĞ':'g',
        'şŞ':'s',
        'üÜ':'u',
        'ıİ':'i',
        'öÖ':'o',
        'I':'i',
        'İ':'i'
    };
    let slug = title;
    for(var key in trMap) {
        slug = slug.replace(new RegExp('['+key+']','g'), trMap[key]);
    }
    return slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
    console.log('[*] Starting Slug Fix Job');

    // 1. Fix Categories
    console.log('[*] Fetching Categories...');
    const { data: categories } = await supabase.from('categories').select('id, title, slug');
    let catUpdates = 0;
    
    for (const cat of categories) {
        if (!cat.title) continue;
        const correct = trSlugify(cat.title);
        // We only fix it if the old slug actually had missing letters or multiple hyphens
        // Actually, we can just safely update all categories that don't match exactly if we assume title matches slug intention.
        // Wait, pre-existing categories might have custom slugs. We should only update if it was imported today.
        // Or if the slug contains "--" or if the slug has missing characters.
        // Best logic: If trSlugify(cat.title) !== cat.slug
        if (correct !== cat.slug) {
            // Some old categories might have manual slugs. Let's just fix the heavily corrupted ones from today
            // A hallmark of corruption is "yaz-c" instead of "yazici".
            // Since there's very few categories (approx 65 total), we can just apply the fix to all that match a pattern.
            // Let's just check if trSlugify(cat.title) is different and `cat.slug` is clearly a stripped version.
            const strippedTitleSlug = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            if (cat.slug === strippedTitleSlug || cat.slug === 'kategori') {
                console.log(`Fixing Category: ${cat.slug} -> ${correct}`);
                await supabase.from('categories').update({ slug: correct }).eq('id', cat.id);
                catUpdates++;
            }
        }
    }
    console.log(`[*] Fixed ${catUpdates} category slugs.`);

    // 2. Fix Products
    // Products created today. We can get them by checking created_at > 1 hour ago
    const timeAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    console.log('[*] Fetching Newly Imported Products...');
    
    let page = 0;
    let prodUpdates = 0;
    while(true) {
        const { data: products } = await supabase
            .from('products')
            .select('id, title, slug')
            .gte('created_at', timeAgo)
            .range(page * 1000, (page + 1) * 1000 - 1);
            
        if (!products || products.length === 0) break;

        for (const prod of products) {
            if (!prod.title) continue;
            const correctBase = trSlugify(prod.title);
            // The product slug has random `-123` at the end. We need to preserve it or just make a new one.
            const strippedTitleBase = prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            // Check if current slug starts with the corrupted stripped base
            if (prod.slug.startsWith(strippedTitleBase)) {
                // Generate a fresh unique suffix
                const freshSuffix = Math.floor(Math.random() * 1000);
                const newSlug = correctBase + '-' + freshSuffix;
                await supabase.from('products').update({ slug: newSlug }).eq('id', prod.id);
                prodUpdates++;
            }
        }
        page++;
    }

    console.log(`[*] Fixed ${prodUpdates} product slugs.`);
    console.log('[*] DONE');
}

run();
