'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SeoScoreProps {
    title: string;
    description: string;
    content?: string | null;
    keyword?: string | null;
}

interface SeoCheck {
    label: string;
    status: 'success' | 'warning' | 'error';
    message: string;
}

export function SeoScore({ title, description, content, keyword }: SeoScoreProps) {
    const [score, setScore] = useState(0);
    const [checks, setChecks] = useState<SeoCheck[]>([]);

    useEffect(() => {
        let newScore = 0;
        const newChecks: SeoCheck[] = [];

        // 1. Title Analysis (Max 30 points)
        const titleLength = title?.length || 0;
        if (titleLength >= 30 && titleLength <= 60) {
            newScore += 30;
            newChecks.push({ label: 'Başlık Uzunluğu', status: 'success', message: 'Mükemmel (30-60 karakter)' });
        } else if (titleLength > 10 && titleLength < 70) {
            newScore += 15;
            newChecks.push({ label: 'Başlık Uzunluğu', status: 'warning', message: 'İyi ama 30-60 karakter arası ideal' });
        } else {
            newChecks.push({ label: 'Başlık Uzunluğu', status: 'error', message: 'Çok kısa veya çok uzun' });
        }

        // 2. Description Analysis (Max 30 points)
        const descLength = description?.length || 0;
        if (descLength >= 120 && descLength <= 160) {
            newScore += 30;
            newChecks.push({ label: 'Açıklama Uzunluğu', status: 'success', message: 'Mükemmel (120-160 karakter)' });
        } else if (descLength > 60 && descLength < 180) {
            newScore += 15;
            newChecks.push({ label: 'Açıklama Uzunluğu', status: 'warning', message: '120-160 karakter arası ideal' });
        } else {
            newChecks.push({ label: 'Açıklama Uzunluğu', status: 'error', message: 'Eksik veya optimize değil' });
        }

        // 3. Content Analysis (Max 20 points)
        if (content) {
            // Remove HTML tags for word count
            const plainText = content.replace(/<[^>]+>/g, '');
            const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

            if (wordCount > 600) {
                newScore += 20;
                newChecks.push({ label: 'İçerik Uzunluğu', status: 'success', message: `Harika! (${wordCount} kelime)` });
            } else if (wordCount > 300) {
                newScore += 10;
                newChecks.push({ label: 'İçerik Uzunluğu', status: 'warning', message: `Yeterli (${wordCount} kelime), ama artırılabilir` });
            } else {
                newScore += 5;
                newChecks.push({ label: 'İçerik Uzunluğu', status: 'error', message: `Çok kısa (${wordCount} kelime), en az 300 olmalı` });
            }

            // 4. Keyword Analysis (Max 20 points)
            if (keyword) {
                const lowerContent = plainText.toLowerCase();
                const lowerTitle = title.toLowerCase();
                const lowerDesc = description.toLowerCase();
                const lowerKeyword = keyword.toLowerCase();

                let keywordScore = 0;
                let messages = [];

                if (lowerTitle.includes(lowerKeyword)) { keywordScore += 5; messages.push('Başlıkta var'); }
                if (lowerDesc.includes(lowerKeyword)) { keywordScore += 5; messages.push('Açıklamada var'); }
                if (lowerContent.split(lowerKeyword).length - 1 >= 2) { keywordScore += 10; messages.push('İçerikte geçiyor'); }

                newScore += keywordScore;
                if (keywordScore >= 20) {
                    newChecks.push({ label: 'Anahtar Kelime', status: 'success', message: 'Mükemmel kullanım' });
                } else if (keywordScore > 5) {
                    newChecks.push({ label: 'Anahtar Kelime', status: 'warning', message: `Kısmen kullanım: ${messages.join(', ')}` });
                } else {
                    newChecks.push({ label: 'Anahtar Kelime', status: 'error', message: 'Anahtar kelime kullanılmamış' });
                }
            } else {
                // If no keyword provided, give mild points for just having content/title
                newScore += 5;
                newChecks.push({ label: 'Anahtar Kelime', status: 'warning', message: 'Anahtar kelime belirtilmemiş' });
            }

        } else {
            newChecks.push({ label: 'İçerik', status: 'error', message: 'İçerik bulunamadı' });
        }

        setScore(Math.min(100, newScore));
        setChecks(newChecks);

    }, [title, description, content, keyword]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                    SEO Analizi
                    <span className={cn(
                        "text-2xl font-bold",
                        score >= 80 ? "text-green-600" : score >= 50 ? "text-orange-500" : "text-red-500"
                    )}>
                        {score}/100
                    </span>
                </CardTitle>
                <Progress value={score} className={cn("h-2",
                    score >= 80 ? "bg-green-100" : score >= 50 ? "bg-orange-100" : "bg-red-100"
                )}>
                    <div
                        className={cn("h-full transition-all",
                            score >= 80 ? "bg-green-600" : score >= 50 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${score}%` }}
                    />
                </Progress>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                            {check.status === 'success' && <CheckCircle2 className="text-green-600 w-4 h-4 mt-0.5 shrink-0" />}
                            {check.status === 'warning' && <AlertCircle className="text-orange-500 w-4 h-4 mt-0.5 shrink-0" />}
                            {check.status === 'error' && <XCircle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />}
                            <div>
                                <p className="font-medium text-slate-700">{check.label}</p>
                                <p className="text-slate-500 text-xs">{check.message}</p>
                            </div>
                        </div>
                    ))}
                    {!content && (
                        <div className="flex items-start gap-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>Detaylı analiz için içerik giriniz.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
