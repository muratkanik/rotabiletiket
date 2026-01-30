import { AdminSidebar } from '@/components/admin/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="pl-64">
                <header className="h-16 bg-white border-b shadow-sm flex items-center px-8 justify-between sticky top-0 z-40">
                    <h2 className="font-semibold text-slate-800">Yönetim Paneli</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Admin User</span>
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
