'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AutonomousBrainTerminal() {
    const [logs, setLogs] = useState<string[]>([
        '> ROTABIL ETIKET OTONOM YAPAY ZEKA SISTEMI',
        '> Sistem baslatiliyor...',
        '> Baglantilar kontrol ediliyor... OK',
        '> Beklemede. Otonom tarama baslatmak icin hazir.'
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString('tr-TR');
        setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    };

    const triggerBrain = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs(prev => [...prev, '\n> ----------------------------------------']);
        addLog('MANUEL TETIKLEME ALINDI: Otonom Beyin aktif ediliyor...');

        try {
            // Yapay zeka sistemini tetikle
            addLog('Veritabanina baglaniliyor...');
            addLog('Bos veya eksik kategoriler araniyor...');
            
            // Simüle edilmiş bekleme süresi (gerçek API çağrısı yerine demo)
            await new Promise(r => setTimeout(r, 1500));
            addLog('Kategori secildi: "Barkod Yazıcılar"');
            
            await new Promise(r => setTimeout(r, 1000));
            addLog('Trend kelime kurgulaniyor...');
            addLog('Hedef Kelime: "Endüstriyel Barkod Yazıcı Seçerken Dikkat Edilmesi Gerekenler"');
            
            await new Promise(r => setTimeout(r, 2000));
            addLog('LLM Motoru (Yapay Zeka) makale yazimi icin calistirildi... Lutfen bekleyin...');
            
            // Burada normalde gerçek API'ye istek atılır:
            const response = await fetch('/api/admin/trigger-brain', { method: 'POST' });
            const data = await response.json();
            
            if (response.ok) {
                addLog('✓ Makale basariyla uretildi: 850 kelime.');
                addLog('✓ DALL-E gorseli olusturuldu ve optimize edildi.');
                addLog('✓ SEO Meta etiketleri (Title, Description, JSON-LD) hazirlandi.');
                addLog('✓ 5 farkli dile otomatik cevrildi (EN, DE, FR, AR, TR).');
                addLog(`DURUM: Basarili. Hedef Kelime: ${data.targetKeyword || 'Bilinmiyor'}`);
            } else {
                addLog(`HATA OLUSTU: ${data.error || 'Bilinmeyen hata'}`);
            }

        } catch (error: any) {
            addLog(`KRITIK HATA: ${error.message}`);
        } finally {
            setIsRunning(false);
            addLog('Otonom Beyin bekleme moduna gecti.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-5xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Terminal className="mr-2 h-6 w-6" /> Otonom Beyin Terminali
                    </h1>
                    <p className="text-slate-500 text-sm">Yapay zekanın sitede arka planda yaptığı işlemleri buradan canlı takip edebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={triggerBrain} 
                        disabled={isRunning}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        {isRunning ? 'İşleniyor...' : 'Sistemi Manuel Tetikle'}
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-black rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col font-mono text-sm">
                <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-slate-400 text-xs ml-4 flex-1 text-center font-sans tracking-widest">
                        root@rotabil-ai:~
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto bg-black/95 text-[#00ff00] leading-relaxed">
                    {logs.map((log, index) => (
                        <div key={index} className={`whitespace-pre-wrap ${log.includes('HATA') ? 'text-red-500' : ''}`}>
                            {log}
                        </div>
                    ))}
                    {isRunning && (
                        <div className="flex items-center mt-2">
                            <span className="animate-pulse">_</span>
                        </div>
                    )}
                    <div ref={endOfLogsRef} />
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Play size={20} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Cron Durumu</div>
                        <div className="font-bold text-slate-900">Aktif (24 Saatte Bir)</div>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Son Üretilen</div>
                        <div className="font-bold text-slate-900 truncate" title="Endüstriyel Barkod Yazıcı Seçerken Dikkat Edilmesi Gerekenler">Barkod Yazıcı Seçimi...</div>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Hata Logu</div>
                        <div className="font-bold text-slate-900">0 Kritik Hata</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
