const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://zninvhkeicgkixhigufo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaW52aGtlaWNna2l4aGlndWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDMzMTMsImV4cCI6MjA4NTM3OTMxM30.CWN1CEWd842ZK5rERg4AXSeFB-Jk9F_pWHBCyRH3wyc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false
    }
});

const PRODUCTS_FILE = path.join(__dirname, '../../backup/products.json');
const DATA_DIR = path.join(__dirname, '../../backup');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-üğışöç]+/g, '')  // Remove all non-word chars (allow Turkish)
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Map Turkish chars for better slugify
function turkishSlugify(text) {
    const trMap = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    let str = text;
    for (let key in trMap) {
        str = str.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return str.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function uploadImage(localPath) {
    try {
        const fullPath = path.join(DATA_DIR, localPath);
        if (!fs.existsSync(fullPath)) return null;

        const fileContent = fs.readFileSync(fullPath);
        const fileName = path.basename(localPath);
        const storagePath = `migrated/${Date.now()}_${fileName}`;

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(storagePath, fileContent, {
                contentType: 'image/jpeg', // Simple assumption, or detect
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error.message);
            return null;
        }

        return storagePath;
    } catch (e) {
        console.error('File read error:', e.message);
        return null;
    }
}

async function main() {
    console.log('Starting migration...');
    const rawData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

    // Filter garbage
    const validItems = rawData.filter(item =>
        item.title &&
        !item.title.includes('Faydalı Linkler') &&
        !['Kurumsal', 'İletişim'].includes(item.category) &&
        !item.title.includes('ROTABİL Hakkında') &&
        !item.title.includes('WEB SİTESİ')
    );

    console.log(`Found ${validItems.length} valid items out of ${rawData.length}`);

    // Cache categories
    const categoryCache = {}; // name -> id

    for (const item of validItems) {
        console.log(`Processing: ${item.title}`);

        // Handle Sectors
        if (item.category === 'Sektörel Çözümler' || item.title.includes('Sektör') || item.title.includes('ÇÖZÜMLERİ')) {
            const slug = turkishSlugify(item.title);

            // Upload first image if exists
            let imageUrl = null;
            if (item.local_images && item.local_images.length > 0) {
                const path = await uploadImage(item.local_images[0]);
                if (path) {
                    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
                    imageUrl = data.publicUrl;
                }
            }

            const { error } = await supabase.from('sectors').upsert({
                title: item.title,
                slug: slug,
                content_html: item.description_html,
                image_url: imageUrl
            }, { onConflict: 'slug' });

            if (error) console.error('Sector insert error:', error.message);
            continue;
        }

        // Handle Products
        // 1. Ensure Category
        let catName = item.category;
        if (catName === 'Etiket') catName = 'Etiketler';
        if (catName === 'Ribon') catName = 'Ribonlar';
        if (catName === 'Barkod Yazıcı') catName = 'Barkod Yazıcılar';

        if (!categoryCache[catName]) {
            const catSlug = turkishSlugify(catName);
            // Create category if not exists
            const { data, error } = await supabase.from('categories')
                .select('id')
                .eq('slug', catSlug)
                .single();

            if (data) {
                categoryCache[catName] = data.id;
            } else {
                const { data: newCat, error: insertError } = await supabase.from('categories')
                    .insert({ title: catName, slug: catSlug })
                    .select()
                    .single();
                if (newCat) categoryCache[catName] = newCat.id;
                else console.error('Category creation failed:', insertError?.message);
            }
        }

        const catId = categoryCache[catName];
        if (!catId) continue;

        const slug = turkishSlugify(item.title);

        // 2. Insert Product
        const { data: prodData, error: prodError } = await supabase.from('products')
            .upsert({
                title: item.title,
                slug: slug,
                category_id: catId,
                description_html: item.description_html,
                specs: item.specs || {},
                seo_title: item.title,
                seo_description: item.title
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (prodError) {
            console.error('Product insert error:', prodError.message);
            continue;
        }

        // 3. Upload and Linked Images
        if (item.local_images && item.local_images.length > 0) {
            for (let i = 0; i < item.local_images.length; i++) {
                const imgPath = await uploadImage(item.local_images[i]);
                if (imgPath) {
                    const { error: imgError } = await supabase.from('product_images').insert({
                        product_id: prodData.id,
                        storage_path: imgPath,
                        is_primary: i === 0
                    });
                    if (imgError) console.error('Image link error:', imgError.message);
                }
            }
        }
    }
    console.log('Migration complete!');
}

main();
