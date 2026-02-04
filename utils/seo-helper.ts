export interface SeoAnalysisResult {
    score: number;
    checks: {
        label: string;
        status: 'success' | 'warning' | 'error';
        message: string;
    }[];
}

export function calculateSeoScore(
    title: string | null | undefined,
    description: string | null | undefined,
    content: string | null | undefined,
    keyword: string | null | undefined
): SeoAnalysisResult {
    let score = 0;
    const checks = [];

    // 1. Title Analysis (Max 30 points)
    const titleLength = title?.length || 0;
    if (titleLength >= 30 && titleLength <= 60) {
        score += 30;
        checks.push({ label: 'Başlık Uzunluğu', status: 'success' as const, message: 'Mükemmel (30-60 karakter)' });
    } else if (titleLength > 10 && titleLength < 70) {
        score += 15;
        checks.push({ label: 'Başlık Uzunluğu', status: 'warning' as const, message: 'İyi ama 30-60 karakter arası ideal' });
    } else {
        checks.push({ label: 'Başlık Uzunluğu', status: 'error' as const, message: 'Çok kısa veya çok uzun' });
    }

    // 2. Description Analysis (Max 30 points)
    const descLength = description?.length || 0;
    if (descLength >= 120 && descLength <= 160) {
        score += 30;
        checks.push({ label: 'Açıklama Uzunluğu', status: 'success' as const, message: 'Mükemmel (120-160 karakter)' });
    } else if (descLength > 60 && descLength < 180) {
        score += 15;
        checks.push({ label: 'Açıklama Uzunluğu', status: 'warning' as const, message: '120-160 karakter arası ideal' });
    } else {
        checks.push({ label: 'Açıklama Uzunluğu', status: 'error' as const, message: 'Eksik veya optimize değil' });
    }

    // 3. Content Analysis (Max 20 points)
    if (content) {
        // Remove HTML tags for word count
        const plainText = content.replace(/<[^>]+>/g, '');
        const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

        if (wordCount > 600) {
            score += 20;
            checks.push({ label: 'İçerik Uzunluğu', status: 'success' as const, message: `Harika! (${wordCount} kelime)` });
        } else if (wordCount > 300) {
            score += 10;
            checks.push({ label: 'İçerik Uzunluğu', status: 'warning' as const, message: `Yeterli (${wordCount} kelime), ama artırılabilir` });
        } else {
            score += 5;
            checks.push({ label: 'İçerik Uzunluğu', status: 'error' as const, message: `Çok kısa (${wordCount} kelime), en az 300 olmalı` });
        }

        // 4. Keyword Analysis (Max 20 points)
        if (keyword) {
            const lowerContent = plainText.toLowerCase();
            const lowerTitle = (title || '').toLowerCase();
            const lowerDesc = (description || '').toLowerCase();
            const lowerKeyword = keyword.toLowerCase();

            let keywordScore = 0;
            const messages = [];

            if (lowerTitle.includes(lowerKeyword)) { keywordScore += 5; messages.push('Başlıkta var'); }
            if (lowerDesc.includes(lowerKeyword)) { keywordScore += 5; messages.push('Açıklamada var'); }
            if (lowerContent.split(lowerKeyword).length - 1 >= 2) { keywordScore += 10; messages.push('İçerikte geçiyor'); }

            score += keywordScore;
            if (keywordScore >= 20) {
                checks.push({ label: 'Anahtar Kelime', status: 'success' as const, message: 'Mükemmel kullanım' });
            } else if (keywordScore > 5) {
                checks.push({ label: 'Anahtar Kelime', status: 'warning' as const, message: `Kısmen kullanım: ${messages.join(', ')}` });
            } else {
                checks.push({ label: 'Anahtar Kelime', status: 'error' as const, message: 'Anahtar kelime kullanılmamış' });
            }
        } else {
            score += 5;
            checks.push({ label: 'Anahtar Kelime', status: 'warning' as const, message: 'Anahtar kelime belirtilmemiş' });
        }

    } else {
        checks.push({ label: 'İçerik', status: 'error' as const, message: 'İçerik bulunamadı' });
    }

    return { score: Math.min(100, score), checks };
}
