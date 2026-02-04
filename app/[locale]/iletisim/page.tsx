
import { getSiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
    title: 'İletişim | Rotabil Etiket',
    description: 'Rotabil Etiket iletişim bilgileri. Adres, telefon ve e-posta.'
}

export default async function ContactPage() {
    const contactInfo = await getSiteSettings('contact_info');

    return (
        <main className="min-h-screen bg-slate-50">


            <div className="bg-slate-900 py-20 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">İletişim</h1>
                <p className="text-slate-400">Bizimle İletişime Geçin</p>
            </div>

            <div className="container px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ofis & Fabrika</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">Adres</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            {contactInfo?.address || "Kurtköy-Pendik/İSTANBUL"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">Telefon</h3>
                                        <p className="text-slate-600">
                                            {contactInfo?.phone || "(+90) 216 595 03 23"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">E-posta</h3>
                                        <p className="text-slate-600">
                                            {contactInfo?.email || "info@rotabiletiket.com"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">Çalışma Saatleri</h3>
                                        <p className="text-slate-600">
                                            Pazartesi - Cuma: 08:30 - 18:00 <br />
                                            Cumartesi: 09:00 - 13:00
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Mesaj Gönderin</h2>
                        <p className="text-slate-500 mb-6">Size en kısa sürede dönüş yapacağız.</p>

                        <ContactForm />
                    </div>
                </div>
            </div>
        </main>
    )
}
