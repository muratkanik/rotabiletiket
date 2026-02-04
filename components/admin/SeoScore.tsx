import { calculateSeoScore } from '@/utils/seo-helper';

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
        const { score: newScore, checks: newChecks } = calculateSeoScore(title, description, content, keyword);
        setScore(newScore);
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
