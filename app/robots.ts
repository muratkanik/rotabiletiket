import { MetadataRoute } from 'next';

const baseUrl = 'https://www.rotabiletiket.com';

// Yapay zeka arama/yanıt botlarına açık izin (llms.txt ile birlikte)
const aiBots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: aiBots,
                allow: ['/', '/llms.txt'],
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
