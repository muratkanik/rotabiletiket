import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

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
            <body className={`${inter.className} antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
