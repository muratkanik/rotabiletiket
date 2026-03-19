import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminLayoutWrapper>
            {children}
        </AdminLayoutWrapper>
    );
}
