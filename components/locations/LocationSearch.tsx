'use client';

import { useState } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Link } from '@/src/i18n/routing';

interface Location {
    city: string;
    district: string | null;
    slug: string;
}

export function LocationSearch({ locations, locale }: { locations: Location[], locale: string }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLocations = locations.filter(loc => {
        const name = (loc.district || loc.city).toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="w-full">
            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-lg"
                    placeholder="İl veya ilçe arayın (Örn: Pendik, İzmir)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredLocations.map((loc) => {
                    const name = loc.district || loc.city;
                    const isCity = !loc.district;
                    
                    return (
                        <Link
                            key={loc.slug}
                            href={`/${loc.slug}-etiket`}
                            className="group flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${isCity ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'} group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                                    <MapPin size={20} />
                                </div>
                                <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                    {name} Etiket
                                </h3>
                            </div>
                            <div className="flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                Hizmetleri Gör <ArrowRight className="ml-1 w-4 h-4" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filteredLocations.length === 0 && (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                    <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Bölge bulunamadı</h3>
                    <p className="text-slate-500">Arama kriterlerinize uygun hizmet bölgesi bulamadık.</p>
                </div>
            )}
        </div>
    );
}
