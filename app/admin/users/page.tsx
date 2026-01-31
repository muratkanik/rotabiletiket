import { getUsers } from './actions';
import { UserList } from '@/components/admin/users/UserList';
import { AddUserForm } from '@/components/admin/users/AddUserForm';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Kullanıcı Yönetimi</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add User Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Yeni Admin Ekle</h2>
                        <AddUserForm />
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <UserList initialUsers={users} />
                    </div>
                </div>
            </div>
        </div>
    );
}
