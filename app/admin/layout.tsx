import '../globals.css';
import { Toaster } from 'sonner';

export const metadata = {
    title: 'Rotabil Etiket - Yönetim Paneli',
    description: 'Admin Dashboard',
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <body className="font-sans antialiased">
                {children}
                <Toaster />
            </body>
        </html>
    );
}
