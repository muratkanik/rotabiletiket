const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
}

async function run() {
    console.log('[*] Starting Import Job');
    
    const urls = fs.readFileSync('/tmp/macro_products.txt', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
    console.log(`[*] Found ${urls.length} URLs to process.`);

    // Check or create category
    let categoryId;
    const catSlug = 'ice-aktarilan-urunler';
    const { data: catExists } = await supabase.from('categories').select('id').eq('slug', catSlug).single();
    if (catExists) {
        categoryId = catExists.id;
        console.log(`[*] Using existing Category ID: ${categoryId}`);
    } else {
        const { data: newCat, error } = await supabase.from('categories').insert({
            title: 'İçe Aktarılan Ürünler',
            slug: catSlug
        }).select().single();
        if (error) throw new Error(`Category creation failed: ${error.message}`);
        categoryId = newCat.id;
        console.log(`[*] Created new Category ID: ${categoryId}`);
        // Also insert translation for category if you want it to show up on TR frontend
        await supabase.from('category_translations').insert({
            category_id: categoryId,
            language_code: 'tr',
            title: 'İçe Aktarılan Ürünler'
        });
    }

    const CONCURRENCY = 5;
    let index = 0;
    
    async function worker(workerId) {
        while (index < urls.length) {
            const currentIndex = index++;
            const url = urls[currentIndex];
            const originalSlug = url.split('/').pop();
            console.log(`[Worker ${workerId}] Processing: ${originalSlug} (${currentIndex+1}/${urls.length})`);
            
            try {
                // Fetch Page
                const { data: html } = await axios.get(url, { timeout: 15000 });
                const $ = cheerio.load(html);
                
                // Parse JSON-LD
                const jsonLdScripts = $('script[type="application/ld+json"]').toArray();
                let productData = null;
                for (const el of jsonLdScripts) {
                    try {
                        const json = JSON.parse($(el).html());
                        if (json['@type'] === 'Product') {
                            productData = json;
                            break;
                        }
                    } catch (e) {}
                }

                if (!productData) {
                    console.log(`[Worker ${workerId}] Skipping ${originalSlug}. No Product JSON-LD found.`);
                    continue;
                }

                const title = productData.name || originalSlug;
                const description = productData.description || 'İçerik Bulunamadı';
                let rawImageUrl = null;
                if (productData.image && productData.image.length > 0) {
                    const firstImage = Array.isArray(productData.image) ? productData.image[0] : productData.image;
                    rawImageUrl = typeof firstImage === 'string' ? firstImage : firstImage.contentUrl;
                }
                
                if (!rawImageUrl) {
                    const imgTag = $('meta[property="og:image"]').attr('content');
                    if (imgTag) rawImageUrl = imgTag;
                }

                const newSlug = generateSlug(title);

                // Insert into products
                const { data: newProduct, error: pErr } = await supabase.from('products').insert({
                    category_id: categoryId,
                    title: title,
                    slug: newSlug,
                    description_html: description,
                    seo_title: title,
                    seo_description: description.substring(0, 150),
                    is_published: true
                }).select().single();

                if (pErr) {
                    console.log(`[Worker ${workerId}] DB Error for ${originalSlug}:`, pErr.message);
                    continue;
                }

                const productId = newProduct.id;

                // Translations
                await supabase.from('product_translations').insert({
                    product_id: productId,
                    language_code: 'tr',
                    title: title,
                    description: description.substring(0, 300),
                    content_html: description,
                    seo_title: title,
                    seo_description: description.substring(0, 150)
                });

                // Download and Upload Image
                if (rawImageUrl) {
                    try {
                        const { data: imgBuffer } = await axios.get(rawImageUrl, { responseType: 'arraybuffer', timeout: 10000 });
                        
                        // Parse extension from Wix. e.g ...webp/v1/... -> .webp
                        let ext = '.webp';
                        if (rawImageUrl.includes('.jpg')) ext = '.jpg';
                        else if (rawImageUrl.includes('.png')) ext = '.png';
                        
                        const fileName = `${newSlug}_macro${ext}`;
                        
                        const { error: upErr } = await supabase.storage.from('product-images').upload(fileName, imgBuffer, {
                            contentType: `image/${ext.replace('.', '')}`,
                            upsert: true
                        });
                        
                        if (upErr) {
                            console.log(`[Worker ${workerId}] Img Upload Error for ${originalSlug}:`, upErr.message);
                        } else {
                            // Link image
                            await supabase.from('product_images').insert({
                                product_id: productId,
                                storage_path: fileName,
                                is_primary: true
                            });
                        }
                    } catch (iErr) {
                        console.log(`[Worker ${workerId}] Image Fetch Error for ${originalSlug} -> ` + iErr.message);
                    }
                }
                
                console.log(`[Worker ${workerId}] SUCCESS: ${title}`);
            } catch (err) {
                console.log(`[Worker ${workerId}] FAILED Page Fetch for ${originalSlug}:`, err.message);
            }
        }
    }

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(i + 1));
    }

    await Promise.all(workers);
    console.log('[*] DONE');
}

run();
