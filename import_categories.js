const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'kategori';
}

// Pages to ignore because they aren't product categories
const ignoreList = ['/iletisim', '/kalite-yonetimi', '/depo-yönetim-sistemi', '/blog', '/urunler', '/basari-hikayeleri', '/destek-hizmetleri', '/satisoncesimuhendislik', '/teknik-servis-ve-bakim-hizmetleri', '/mobilcihazyönetimi', '/uretimyonetimsistemi', '/bizkimiz', '/gizlilik-politikası', '/referanslar', '/demirbastakipsistemi'];

async function run() {
    console.log('[*] Starting Category Import Job');

    const urls = fs.readFileSync('/tmp/macro_categories.txt', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
    
    // Sort all products into memory for faster searching
    const { data: allProducts } = await supabase.from('products').select('id, title');
    console.log(`[*] Loaded ${allProducts.length} products to map.`);

    for (const macroUrl of urls) {
        if (macroUrl === 'https://www.macro-tr.com' || ignoreList.some(ig => macroUrl.includes(ig))) {
            continue;
        }

        try {
            const { data: html } = await axios.get(macroUrl);
            const $ = cheerio.load(html);

            // Fetch page title to use as category name
            let catTitle = $('h1').first().text().trim();
            if (!catTitle) catTitle = $('h2').first().text().trim();
            if (!catTitle) {
                // Fallback to URL path formatting, e.g. /datalogic-barkod-okuyucular -> Datalogic Barkod Okuyucular
                const slug = macroUrl.split('/').pop();
                catTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }

            console.log(`\n===============\n[*] Processing Category: ${catTitle} (${macroUrl})`);
            
            // Extract product titles
            const productTitles = new Set();
            $('a[href*="/product-page/"]').each((i, el) => {
                const title = $(el).text().trim() || $(el).attr('aria-label');
                if (title && title.length > 5 && title !== 'Hızlı Bakış') {
                    productTitles.add(title);
                }
            });

            const titlesArray = Array.from(productTitles);
            console.log(`Found ${titlesArray.length} product links inside ${catTitle}`);

            if (titlesArray.length === 0) continue;

            const catSlug = generateSlug(catTitle);

            // 1. Create or get Category in Supabase
            let categoryId;
            const { data: catExists } = await supabase.from('categories').select('id').eq('slug', catSlug).single();
            if (catExists) {
                categoryId = catExists.id;
            } else {
                const { data: newCat, error } = await supabase.from('categories').insert({
                    title: catTitle,
                    slug: catSlug
                }).select().single();
                if (error) {
                    console.log('Error creating category:', error.message);
                    continue;
                }
                categoryId = newCat.id;
                await supabase.from('category_translations').insert({
                    category_id: categoryId,
                    language_code: 'tr',
                    title: catTitle
                });
            }

            let matchedCount = 0;
            // 2. Update matching products
            for (const title of titlesArray) {
                // Find products that match this title exactly
                const matchedProducts = allProducts.filter(p => p.title.toLowerCase() === title.toLowerCase());
                
                if (matchedProducts.length > 0) {
                    for (const prod of matchedProducts) {
                        await supabase.from('products').update({ category_id: categoryId }).eq('id', prod.id);
                        matchedCount++;
                    }
                }
            }

            console.log(`-> Successfully categorized ${matchedCount} items into ${catTitle} (${catSlug})`);

        } catch (err) {
            console.log(`Failed to process ${macroUrl}:`, err.message);
        }
    }
    console.log('[*] DONE');
}

run();
