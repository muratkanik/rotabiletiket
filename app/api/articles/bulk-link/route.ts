import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow 60 seconds

export async function POST(req: Request) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return NextResponse.json({ error: "Supabase Service Role Key eksik." }, { status: 500 });

        // 1. Fetch all article translations
        const { data: articles, error: articlesErr } = await supabase
            .from('article_translations')
            .select('id, article_id, language_code, title, slug, content_html, keywords');

        if (articlesErr) throw articlesErr;

        // 2. Fetch all product translations
        const { data: products, error: productsErr } = await supabase
            .from('product_translations')
            .select('id, product_id, language_code, title, slug, keywords');

        if (productsErr) throw productsErr;

        // 3. Build a dictionary of keywords to link
        // Link structure: { keywordText: { url: string, type: 'article' | 'product', length: number } }
        const keywordDict: { [lang: string]: { keyword: string, url: string }[] } = {};

        // Helper to add keyword
        const addKeyword = (lang: string, kw: string, url: string) => {
            if (!kw) return;
            const cleaned = kw.trim().toLowerCase();
            if (cleaned.length < 3) return; // Skip very short words
            if (!keywordDict[lang]) keywordDict[lang] = [];

            // Only add if it doesn't already exist (or prioritize exactly)
            if (!keywordDict[lang].find(k => k.keyword === cleaned)) {
                keywordDict[lang].push({ keyword: cleaned, url });
            }
        };

        // Articles dict (/bilgi-bankasi/[slug])
        articles.forEach(a => {
            const lang = a.language_code || 'tr';
            // Add Title itself as a keyword
            if (a.title) addKeyword(lang, a.title, `/bilgi-bankasi/${a.slug}`);
            // Add comma separated keywords
            if (a.keywords) {
                a.keywords.split(',').forEach((k: string) => addKeyword(lang, k, `/bilgi-bankasi/${a.slug}`));
            }
        });

        // Products dict (/urunler/[slug])
        products.forEach(p => {
            const lang = p.language_code || 'tr';
            if (p.title) addKeyword(lang, p.title, `/urunler/${p.slug}`);
            if (p.keywords) {
                p.keywords.split(',').forEach((k: string) => addKeyword(lang, k, `/urunler/${p.slug}`));
            }
        });

        // Sort keywords by length descending so we match longer phrases first (e.g. "Silvermat Etiket" over "Etiket")
        Object.keys(keywordDict).forEach(lang => {
            keywordDict[lang].sort((a, b) => b.keyword.length - a.keyword.length);
        });

        // 4. Perform the replacements and calculate stats
        let totalLinksCreated = 0;
        let articlesUpdated = 0;

        for (const article of articles) {
            if (!article.content_html) continue;

            const lang = article.language_code || 'tr';
            const dict = keywordDict[lang] || [];
            if (dict.length === 0) continue;

            let updatedHTML = article.content_html;
            let linksAddedInArticle = 0;

            for (const { keyword, url } from dict) {
                // Don't link if the keyword's url is the current article's URL itself!
                if (url === `/bilgi-bankasi/${article.slug}`) continue;

            // Splitting by HTML tags ensures text nodes are isolated
            const parts = updatedHTML.split(/(<[^>]+>)/g);
            let inAnchor = false;

            // Escape regex special chars
            const escapeRegex = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Regex for word boundary that supports Turkish characters
            const wordPattern = new RegExp(`(?<![\\wğüşıöçĞÜŞİÖÇ])(${escapeRegex(keyword)})(?![\\wğüşıöçĞÜŞİÖÇ])`, 'gi');

            for (let i = 0; i < parts.length; i++) {
                const str = parts[i];

                if (str.startsWith('<a ') || str.startsWith('<A ')) {
                    inAnchor = true;
                } else if (str.startsWith('</a>') || str.startsWith('</A>')) {
                    inAnchor = false;
                }

                // IF it's not a tag AND we are not inside an <a> tag, it's safe to replace text
                if (!str.startsWith('<') && !inAnchor) {
                    const originalStr = parts[i];
                    parts[i] = parts[i].replace(wordPattern, (match) => {
                        return `<a href="${url}" class="text-blue-600 font-medium hover:underline" title="${keyword}">${match}</a>`;
                    });
                    if (originalStr !== parts[i]) {
                        linksAddedInArticle++;
                        totalLinksCreated++;
                    }
                }
            }
            updatedHTML = parts.join('');
        }

        if (linksAddedInArticle > 0) {
            // Update DB
            const { error: updateErr } = await supabase
                .from('article_translations')
                .update({ content_html: updatedHTML })
                .eq('id', article.id);

            if (updateErr) {
                console.error("Error updating article", article.id, updateErr);
            } else {
                articlesUpdated++;
                // Optional: We should also update the base `articles` table if this is the TR translation
                if (lang === 'tr') {
                    await supabase.from('articles').update({ content_html: updatedHTML }).eq('id', article.article_id);
                }
            }
        }
    }

        return NextResponse.json({
        success: true,
        stats: {
            totalKeywordsFound: Object.values(keywordDict).flat().length,
            articlesUpdated,
            totalLinksCreated
        }
    });

} catch (e: any) {
    console.error("Bulk Link Error:", e);
    return NextResponse.json({ error: e.message || "Bilinmeyen hata" }, { status: 500 });
}
}
