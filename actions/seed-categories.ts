'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const CATEGORIES = [
    {
        key: 'etiketler',
        image: 'category-labels.png',
        tr: { title: 'Etiketler', slug: 'etiketler', desc: 'Endüstriyel rulo etiket çeşitleri.' },
        en: { title: 'Labels', slug: 'labels', desc: 'Industrial roll label types.' },
        de: { title: 'Etiketten', slug: 'etiketten', desc: 'Industrielle Rollenetiketten.' },
        fr: { title: 'Étiquettes', slug: 'etiquettes', desc: 'Types d\'étiquettes en rouleau industriel.' },
        ar: { title: 'ملصقات', slug: 'labels-ar', desc: 'أنواع ملصقات لفة الصناعية.' }
    },
    {
        key: 'ribonlar',
        image: 'category-ribbons.png',
        tr: { title: 'Ribonlar', slug: 'ribonlar', desc: 'Termal transfer ribon çeşitleri.' },
        en: { title: 'Ribbons', slug: 'ribbons', desc: 'Thermal transfer ribbons.' },
        de: { title: 'Farbbänder', slug: 'farbbander', desc: 'Thermotransfer-Farbbänder.' },
        fr: { title: 'Rubans', slug: 'rubans', desc: 'Rubans à transfert thermique.' },
        ar: { title: 'شرائط', slug: 'ribbons-ar', desc: 'شرائط النقل الحراري.' }
    },
    {
        key: 'barkod-yazicilar',
        image: 'category-printers.png',
        tr: { title: 'Barkod Yazıcılar', slug: 'barkod-yazicilar', desc: 'Endüstriyel ve masaüstü barkod yazıcılar.' },
        en: { title: 'Barcode Printers', slug: 'barcode-printers', desc: 'Industrial and desktop barcode printers.' },
        de: { title: 'Barcode-Drucker', slug: 'barcode-drucker', desc: 'Industrie- und Desktop-Barcode-Drucker.' },
        fr: { title: 'Imprimantes Code-Barres', slug: 'imprimantes-code-barres', desc: 'Imprimantes de codes-barres industrielles et de bureau.' },
        ar: { title: 'طابعات الباركود', slug: 'barcode-printers-ar', desc: 'طابعات الباركود الصناعية والمكتبية.' }
    },
    {
        key: 'yedek-parca', // Adjust based on DB existence
        image: 'category-printheads.png',
        tr: { title: 'Yedek Parça', slug: 'yedek-parca', desc: 'Yazıcı kafaları ve yedek parçalar.' },
        en: { title: 'Spare Parts', slug: 'spare-parts', desc: 'Printheads and spare parts.' },
        de: { title: 'Ersatzteile', slug: 'ersatzteile', desc: 'Druckköpfe und Ersatzteile.' },
        fr: { title: 'Pièces de Rechange', slug: 'pieces-de-rechange', desc: 'Têtes d\'impression et pièces de rechange.' },
        ar: { title: 'قطع غيار', slug: 'spare-parts-ar', desc: 'رؤوس الطباعة وقطع الغيار.' }
    }
];

export async function seedAccessoryData() {
    const supabase = await createClient();
    const results = [];

    // 1. Fetch existing categories to map IDs
    const { data: existingCats } = await supabase.from('categories').select('*');

    for (const cat of CATEGORIES) {
        // Find by slug-like match or create
        const dbCat = existingCats?.find(c => c.slug?.includes(cat.key) || c.title?.toLowerCase().includes(cat.tr.title.toLowerCase()));

        let catId;

        if (dbCat) {
            catId = dbCat.id;
            // Update Image
            await supabase.from('categories').update({
                image_url: cat.image,
                title: cat.tr.title, // Reset title to standard
                slug: cat.tr.slug
            }).eq('id', catId);
            results.push(`Updated ${cat.tr.title} image and base data.`);
        } else {
            // Create if missing
            const { data: newCat, error } = await supabase.from('categories').insert({
                title: cat.tr.title,
                slug: cat.tr.slug,
                description: cat.tr.desc,
                image_url: cat.image
            }).select().single();

            if (newCat) {
                catId = newCat.id;
                results.push(`Created ${cat.tr.title}.`);
            } else {
                results.push(`Failed to create ${cat.tr.title}: ${error?.message}`);
                continue;
            }
        }

        // 2. Insert Translations
        const languages = ['en', 'de', 'fr', 'ar'];
        for (const lang of languages) {
            const transData = cat[lang as keyof typeof cat] as any;
            if (!transData) continue;

            const { error: transError } = await supabase.from('category_translations').upsert({
                category_id: catId,
                language_code: lang,
                title: transData.title,
                slug: transData.slug,
                description: transData.desc
            }, { onConflict: 'category_id, language_code' });

            if (transError) {
                console.error(`Error translating ${cat.tr.title} to ${lang}:`, transError);
            }
        }
        results.push(`  + Translations added for ${cat.tr.title}`);
    }

    revalidatePath('/', 'layout');
    return { success: true, messages: results };
}
