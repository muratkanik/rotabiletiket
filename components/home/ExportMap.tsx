import { MapPin, ArrowUpRight, Globe2 } from 'lucide-react';

type Locale = 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'es' | 'it';

const copy: Record<Locale, { eyebrow: string; title: string; description: string; note: string; countries: string; exportFrom: string }> = {
    tr: { eyebrow: 'DÜNYAYA AÇILAN ROTABİL', title: 'İhracat noktalarımız', description: 'Türkiye’de ürettiğimiz etiket çözümlerini farklı pazarlardaki iş ortaklarımıza ulaştırıyoruz.', note: 'Gösterilen noktalar şehir merkezlerinin koordinatları baz alınarak hazırlanmıştır.', countries: 'İhracat yaptığımız ülkeler', exportFrom: 'Türkiye’den' },
    en: { eyebrow: 'ROTABIL GOES GLOBAL', title: 'Our export destinations', description: 'We deliver label solutions manufactured in Türkiye to business partners across different markets.', note: 'Locations are plotted using city-centre coordinates.', countries: 'Export destinations', exportFrom: 'From Türkiye' },
    de: { eyebrow: 'ROTABIL WIRD GLOBAL', title: 'Unsere Exportziele', description: 'Wir liefern in Türkiye hergestellte Etikettenlösungen an Geschäftspartner in verschiedenen Märkten.', note: 'Die Punkte basieren auf den Koordinaten der Stadtzentren.', countries: 'Exportländer', exportFrom: 'Aus Türkiye' },
    fr: { eyebrow: 'ROTABIL À L’INTERNATIONAL', title: 'Nos destinations d’exportation', description: 'Nous livrons des solutions d’étiquetage fabriquées en Türkiye à nos partenaires sur différents marchés.', note: 'Les points sont positionnés selon les coordonnées des centres-villes.', countries: 'Pays d’exportation', exportFrom: 'Depuis la Türkiye' },
    ar: { eyebrow: 'روتابيل إلى العالم', title: 'وجهات التصدير لدينا', description: 'نقدم حلول الملصقات المصنّعة في تركيا لشركائنا في الأسواق المختلفة.', note: 'تم تحديد النقاط وفق إحداثيات مراكز المدن.', countries: 'دول التصدير', exportFrom: 'من تركيا' },
    es: { eyebrow: 'ROTABIL EN EL MUNDO', title: 'Nuestros destinos de exportación', description: 'Llevamos soluciones de etiquetado fabricadas en Türkiye a nuestros socios en distintos mercados.', note: 'Los puntos se han colocado usando las coordenadas de los centros urbanos.', countries: 'Países de exportación', exportFrom: 'Desde Türkiye' },
    it: { eyebrow: 'ROTABIL NEL MONDO', title: 'Le nostre destinazioni di export', description: 'Portiamo soluzioni di etichettatura prodotte in Türkiye ai nostri partner nei diversi mercati.', note: 'I punti sono posizionati in base alle coordinate dei centri cittadini.', countries: 'Paesi di esportazione', exportFrom: 'Dalla Türkiye' },
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

const origin = { country: 'Türkiye', city: 'Ankara', lat: 39.9334, lon: 32.8597 };
const WIDTH = 1000;
const HEIGHT = 500;
const project = (lat: number, lon: number) => ({ x: ((lon + 180) / 360) * WIDTH, y: ((90 - lat) / 180) * HEIGHT });

export function ExportMap({ locale }: { locale: string }) {
    const text = copy[(locale as Locale) in copy ? locale as Locale : 'tr'];
    const language = (locale as Locale) in localizedDestinations ? locale as Locale : 'tr';
    const destinationText = (key: string) => localizedDestinations[language][key];
    const originPoint = project(origin.lat, origin.lon);

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
                        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={text.title} className="h-auto min-h-[300px] w-full rounded-2xl bg-[#0b4169]">
                            <defs>
                                <pattern id="export-grid" width="100" height="62.5" patternUnits="userSpaceOnUse">
                                    <path d="M 100 0 L 0 0 0 62.5" fill="none" stroke="#9fd8ed" strokeOpacity=".12" strokeWidth="1" />
                                </pattern>
                                <radialGradient id="export-glow" cx="52%" cy="38%" r="75%"><stop offset="0" stopColor="#2d7897" stopOpacity=".7" /><stop offset="1" stopColor="#082c4d" stopOpacity=".2" /></radialGradient>
                            </defs>
                            <rect width={WIDTH} height={HEIGHT} fill="url(#export-glow)" />
                            <rect width={WIDTH} height={HEIGHT} fill="url(#export-grid)" />
                            <path d="M220 104C260 78 316 73 357 92l27 29 51-11 47 20 40-9 39 22 73-7 50 24 94-6 38 33-57 28-88-9-31 29-84-8-45-29-70 19-60-26-78 5-61-29z" fill="#d4dfc4" fillOpacity=".52" />
                            <path d="M392 199l50-20 48 23 29 48-12 57-30 53-32 63-38-23-16-57-25-48 18-46-18-34z" fill="#cbd8bc" fillOpacity=".55" />
                            <path d="M708 65l69 13 40 30 80 3 53 38-35 35-65-5-37 28-62-20-29-37-50-17 21-39z" fill="#d4dfc4" fillOpacity=".45" />
                            <path d="M101 270l71-21 50 29 25 50-35 62-60 25-65-39-30-50z" fill="#cbd8bc" fillOpacity=".38" />
                            {destinations.map((destination) => {
                                const point = project(destination.lat, destination.lon);
                                return <path key={`route-${destination.country}`} d={`M ${originPoint.x} ${originPoint.y} Q ${(originPoint.x + point.x) / 2} ${(originPoint.y + point.y) / 2 - 28} ${point.x} ${point.y}`} fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="2.2" />;
                            })}
                            <circle cx={originPoint.x} cy={originPoint.y} r="12" fill="#dc2626" stroke="white" strokeWidth="3" />
                            <text x={originPoint.x + 16} y={originPoint.y - 14} fill="white" fontSize="16" fontWeight="700">Türkiye</text>
                            {destinations.map((destination, index) => {
                                const point = project(destination.lat, destination.lon);
                                return <g key={destination.country}><circle cx={point.x} cy={point.y} r="11" fill={destination.color} stroke="white" strokeWidth="3" /><text x={point.x + 15} y={point.y + 5} fill="white" fontSize="14" fontWeight="700">{index + 1}</text></g>;
                            })}
                        </svg>
                        <p className="px-2 pt-3 text-xs text-slate-300">{text.note}</p>
                    </div>

                    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                        <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-300">{text.countries}</p>
                        <div className="space-y-3">
                            {destinations.map((destination, index) => { const [country, city] = destinationText(destination.key); return <div key={destination.country} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: destination.color }}>{index + 1}</span><span className="text-2xl" aria-hidden="true">{destination.flag}</span><div className="min-w-0"><p className="truncate font-semibold">{country}</p><p className="text-sm text-slate-300">{city}</p></div><ArrowUpRight className="ml-auto h-4 w-4 text-slate-400" /></div>; })}
                        </div>
                        <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-sm text-slate-300"><MapPin className="h-4 w-4 text-orange-400" />{text.exportFrom} {origin.city}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
