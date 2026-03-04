"use client"

import { useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface HackerScreenModalProps {
    isOpen: boolean;
    logs: string[];
    onClose?: () => void;
    title?: string;
}

export function HackerScreenModal({ isOpen, logs, onClose, title = "AI SERP ENHANCER OVERRIDE" }: HackerScreenModalProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && onClose) onClose();
        }}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[700px] border-none bg-black text-green-400 font-mono shadow-[0_0_50px_rgba(0,255,0,0.15)] overflow-hidden">
                <DialogHeader className="border-b border-green-900 pb-4 mb-4">
                    <DialogTitle className="text-green-500 font-bold tracking-widest flex items-center gap-2 text-xl">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        {title}
                    </DialogTitle>
                    <div id="hacker-screen-desc" className="sr-only">AI Enhancement Process Logs</div>
                </DialogHeader>

                <div className="relative h-[400px] w-full bg-black/50 rounded p-4 overflow-y-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
                    {/* Scanline overlay effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>

                    {logs.length === 0 ? (
                        <div className="text-green-700 opacity-50 italic">Sistem bağlantısı kuruluyor...</div>
                    ) : (
                        <ul className="space-y-2 z-20 relative">
                            {logs.map((log, index) => (
                                <li
                                    key={index}
                                    className={`${log.includes('ERROR') || log.includes('KRITIK') ? 'text-red-500' :
                                        log.includes('BAŞARILI') ? 'text-green-300 font-bold' :
                                            'text-green-500'} 
                                                animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <span className="opacity-50 text-xs mr-3">[{new Date().toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                    {log}
                                </li>
                            ))}
                            <div ref={bottomRef} className="h-1" />
                        </ul>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center text-xs text-green-800">
                    <div>STATUS: {logs.length > 0 && logs[logs.length - 1].includes('BAŞARILI') ? 'COMPLETED' : 'PROCESSING...'}</div>
                    <div className="flex items-center gap-4">
                        <span className="animate-pulse">do not close window</span>
                        {onClose && (
                            <button onClick={onClose} className="px-3 py-1 bg-green-900/30 text-green-500 hover:bg-green-800/50 rounded border border-green-900 transition-colors">
                                [ X ] KAPAT
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
