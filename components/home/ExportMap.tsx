import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Globe2, MapPin } from 'lucide-react';

type Locale = 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'es' | 'it';

const copy: Record<Locale, { eyebrow: string; title: string; description: string; note: string; countries: string; exportFrom: string; cta: string }> = {
    tr: { eyebrow: 'DÜNYAYA AÇILAN ROTABİL', title: 'İhracat noktalarımız', description: 'Türkiye’de ürettiğimiz etiket çözümlerini farklı pazarlardaki iş ortaklarımıza ulaştırıyoruz.', note: 'Noktalar şehir merkezlerinin gerçek koordinatlarıyla, equirectangular dünya projeksiyonu üzerinde gösterilir.', countries: 'İhracat yaptığımız ülkeler', exportFrom: 'Çıkış noktası: Türkiye', cta: 'Teknik çözümleri incele' },
    en: { eyebrow: 'ROTABIL GOES GLOBAL', title: 'Our export destinations', description: 'We deliver label solutions manufactured in Türkiye to business partners across different markets.', note: 'Locations use real city-centre coordinates on an equirectangular world projection.', countries: 'Export destinations', exportFrom: 'Origin: Türkiye', cta: 'Explore technical solutions' },
    de: { eyebrow: 'ROTABIL WIRD GLOBAL', title: 'Unsere Exportziele', description: 'Wir liefern in Türkiye hergestellte Etikettenlösungen an Geschäftspartner in verschiedenen Märkten.', note: 'Die Punkte verwenden echte Stadtkoordinaten auf einer equirektangularen Weltkarte.', countries: 'Exportländer', exportFrom: 'Ausgangsort: Türkiye', cta: 'Technische Lösungen ansehen' },
    fr: { eyebrow: 'ROTABIL À L’INTERNATIONAL', title: 'Nos destinations d’exportation', description: 'Nous livrons des solutions d’étiquetage fabriquées en Türkiye à nos partenaires sur différents marchés.', note: 'Les points utilisent les coordonnées réelles des villes sur une projection équirectangulaire.', countries: 'Pays d’exportation', exportFrom: 'Origine : Türkiye', cta: 'Découvrir les solutions techniques' },
    ar: { eyebrow: 'روتابيل إلى العالم', title: 'وجهات التصدير لدينا', description: 'نقدم حلول الملصقات المصنّعة في تركيا لشركائنا في الأسواق المختلفة.', note: 'تستخدم النقاط إحداثيات المدن الحقيقية على إسقاط عالمي متساوي المستطيلات.', countries: 'دول التصدير', exportFrom: 'نقطة الانطلاق: تركيا', cta: 'استكشف الحلول التقنية' },
    es: { eyebrow: 'ROTABIL EN EL MUNDO', title: 'Nuestros destinos de exportación', description: 'Llevamos soluciones de etiquetado fabricadas en Türkiye a nuestros socios en distintos mercados.', note: 'Los puntos usan las coordenadas reales de las ciudades sobre una proyección equirectangular.', countries: 'Países de exportación', exportFrom: 'Origen: Türkiye', cta: 'Descubre las soluciones técnicas' },
    it: { eyebrow: 'ROTABIL NEL MONDO', title: 'Le nostre destinazioni di export', description: 'Portiamo soluzioni di etichettatura prodotte in Türkiye ai nostri partner nei diversi mercati.', note: 'I punti usano le coordinate reali delle città su una proiezione equirettangolare.', countries: 'Paesi di esportazione', exportFrom: 'Origine: Türkiye', cta: 'Scopri le soluzioni tecniche' },
};

const destinations = [
    { key: 'qatar', country: 'Katar', city: 'Doha', flag: '🇶🇦', color: '#f97316', lat: 25.2854, lon: 51.5310 },
    { key: 'uae', country: 'Birleşik Arap Emirlikleri', city: 'Dubai', flag: '🇦🇪', color: '#16a34a', lat: 25.2048, lon: 55.2708 },
    { key: 'saudi', country: 'Suudi Arabistan', city: 'Riyad', flag: '🇸🇦', color: '#22c55e', lat: 24.7136, lon: 46.6753 },
    { key: 'egypt', country: 'Mısır', city: 'Kahire', flag: '🇪🇬', color: '#f59e0b', lat: 30.0444, lon: 31.2357 },
    { key: 'cameroon', country: 'Kamerun', city: 'Yaoundé', flag: '🇨🇲', color: '#0ea5e9', lat: 3.8480, lon: 11.5021 },
    { key: 'albania', country: 'Arnavutluk', city: 'Tiran', flag: '🇦🇱', color: '#a855f7', lat: 41.3275, lon: 19.8187 },
];

const localizedDestinations: Record<Locale, Record<string, [string, string]>> = {
    tr: { qatar: ['Katar', 'Doha'], uae: ['Birleşik Arap Emirlikleri', 'Dubai'], saudi: ['Suudi Arabistan', 'Riyad'], egypt: ['Mısır', 'Kahire'], cameroon: ['Kamerun', 'Yaoundé'], albania: ['Arnavutluk', 'Tiran'] },
    en: { qatar: ['Qatar', 'Doha'], uae: ['United Arab Emirates', 'Dubai'], saudi: ['Saudi Arabia', 'Riyadh'], egypt: ['Egypt', 'Cairo'], cameroon: ['Cameroon', 'Yaoundé'], albania: ['Albania', 'Tirana'] },
    de: { qatar: ['Katar', 'Doha'], uae: ['Vereinigte Arabische Emirate', 'Dubai'], saudi: ['Saudi-Arabien', 'Riad'], egypt: ['Ägypten', 'Kairo'], cameroon: ['Kamerun', 'Yaoundé'], albania: ['Albanien', 'Tirana'] },
    fr: { qatar: ['Qatar', 'Doha'], uae: ['Émirats arabes unis', 'Dubaï'], saudi: ['Arabie saoudite', 'Riyad'], egypt: ['Égypte', 'Le Caire'], cameroon: ['Cameroun', 'Yaoundé'], albania: ['Albanie', 'Tirana'] },
    ar: { qatar: ['قطر', 'الدوحة'], uae: ['الإمارات العربية المتحدة', 'دبي'], saudi: ['المملكة العربية السعودية', 'الرياض'], egypt: ['مصر', 'القاهرة'], cameroon: ['الكاميرون', 'ياوندي'], albania: ['ألبانيا', 'تيرانا'] },
    es: { qatar: ['Catar', 'Doha'], uae: ['Emiratos Árabes Unidos', 'Dubái'], saudi: ['Arabia Saudita', 'Riad'], egypt: ['Egipto', 'El Cairo'], cameroon: ['Camerún', 'Yaundé'], albania: ['Albania', 'Tirana'] },
    it: { qatar: ['Qatar', 'Doha'], uae: ['Emirati Arabi Uniti', 'Dubai'], saudi: ['Arabia Saudita', 'Riyad'], egypt: ['Egitto', 'Il Cairo'], cameroon: ['Camerun', 'Yaoundé'], albania: ['Albania', 'Tirana'] },
};

// The asset is an equirectangular map. Its source SVG has a small vertical
// margin around the 180° latitude range, hence MAP_TOP_MARGIN.
const MAP_WIDTH = 2752.766;
const MAP_HEIGHT = 1537.631;
const MAP_SCALE = MAP_WIDTH / 360;
const MAP_TOP_MARGIN = (MAP_HEIGHT - MAP_SCALE * 180) / 2;
// Rotabil export origin: Istanbul, Türkiye.
const origin = { city: 'İstanbul', lat: 41.0082, lon: 28.9784 };
const project = (lat: number, lon: number) => ({ x: (lon + 180) * MAP_SCALE, y: MAP_TOP_MARGIN + (90 - lat) * MAP_SCALE });

export function ExportMap({ locale }: { locale: string }) {
    const language = (locale as Locale) in copy ? locale as Locale : 'tr';
    const text = copy[language];
    const originPoint = project(origin.lat, origin.lon);
    const destinationText = (key: string) => localizedDestinations[language][key];

    return (
        <section className="overflow-hidden bg-[#071d36] py-20 text-white">
            <div className="container px-4 md:px-6">
                <div className="mb-10 max-w-3xl">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-orange-400"><Globe2 className="h-4 w-4" />{text.eyebrow}</div>
                    <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{text.title}</h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{text.description}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
                    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0b3555] p-2 shadow-2xl md:p-4">
                        <div className="relative aspect-[1.8] overflow-hidden rounded-2xl bg-[#0b3555]">
                            <Image src="/world-map.svg" alt="" fill priority unoptimized aria-hidden className="object-fill opacity-75" />
                            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={text.title} className="absolute inset-0 h-full w-full">
                                <defs><filter id="marker-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#020617" floodOpacity=".8" /></filter></defs>
                                {destinations.map((destination) => { const point = project(destination.lat, destination.lon); return <path key={`route-${destination.key}`} d={`M ${originPoint.x} ${originPoint.y} Q ${(originPoint.x + point.x) / 2} ${(originPoint.y + point.y) / 2 - 35} ${point.x} ${point.y}`} fill="none" stroke="#f8fafc" strokeOpacity=".9" strokeWidth="4" strokeDasharray="12 10" />; })}
                                <circle cx={originPoint.x} cy={originPoint.y} r="18" fill="#dc2626" stroke="white" strokeWidth="6" filter="url(#marker-shadow)" />
                                <circle cx={originPoint.x} cy={originPoint.y} r="6" fill="white" />
                                {destinations.map((destination, index) => { const point = project(destination.lat, destination.lon); return <g key={destination.key} filter="url(#marker-shadow)"><circle cx={point.x} cy={point.y} r="17" fill={destination.color} stroke="white" strokeWidth="5" /><text x={point.x} y={point.y + 7} textAnchor="middle" fill="white" fontSize="22" fontWeight="800">{index + 1}</text></g>; })}
                            </svg>
                            <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">{text.exportFrom} · {origin.city}</div>
                        </div>
                        <p className="px-2 pt-3 text-xs text-slate-300">{text.note}</p>
                    </div>

                    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                        <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-300">{text.countries}</p>
                        <div className="space-y-3">{destinations.map((destination, index) => { const [country, city] = destinationText(destination.key); return <div key={destination.key} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: destination.color }}>{index + 1}</span><span className="text-2xl" aria-hidden="true">{destination.flag}</span><div className="min-w-0"><p className="truncate font-semibold">{country}</p><p className="text-sm text-slate-300">{city}</p></div><ArrowUpRight className="ml-auto h-4 w-4 text-slate-400" /></div>; })}</div>
                        <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-sm text-slate-300"><MapPin className="h-4 w-4 text-orange-400" />{text.exportFrom} · {origin.city}</div>
                    </div>
                </div>
                <div className="mt-8"><Link href="/cozumler" className="inline-flex items-center rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-500">{text.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link></div>
            </div>
        </section>
    );
}
