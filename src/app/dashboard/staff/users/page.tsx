'use client';

import { useEffect, useState } from 'react';
import StaffGuard from '@/src/components/auth/StaffGuard';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { db } from '@/src/lib/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Users,
} from 'lucide-react';

type AppUser = {
  id: string;
  fullName?: string;
  email?: string;
  role?: 'student' | 'staff';
  matricNumber?: string;
  phoneNumber?: string;
  department?: string;
  college?: string;
  level?: string;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<AppUser, 'id'>),
      }));
      setUsers(data);
    } catch (error) {
      setMessage('Failed to load users.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function changeRole(userId: string, role: 'student' | 'staff') {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      setMessage(`User updated to ${role}.`);
      setOpenMenuId(null);
      await fetchUsers();
    } catch (error) {
      setMessage('Unable to update user role.');
      console.error(error);
    }
  }

  async function removeUser(userId: string) {
    const confirmed = window.confirm('Delete this user?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      setMessage('User deleted successfully.');
      setOpenMenuId(null);
      await fetchUsers();
    } catch (error) {
      setMessage('Unable to delete user.');
      console.error(error);
    }
  }

  return (
    <StaffGuard>
      <DashboardLayout title="Manage Users" sidebar={<StaffSidebar />}>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Users size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                  User Management
                </p>
                <h1 className="text-3xl font-bold text-slate-900">All users</h1>
                <p className="text-sm text-slate-600">
                  Promote students to staff, revert staff to students, or delete users.
                </p>
              </div>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Matric Number</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-6 py-8 text-slate-500" colSpan={6}>
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-slate-500" colSpan={6}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {user.fullName || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{user.email || '-'}</td>
                        <td className="px-6 py-4 text-slate-700">{user.matricNumber || '-'}</td>
                        <td className="px-6 py-4 text-slate-700">{user.department || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.role === 'staff'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {user.role || 'student'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(openMenuId === user.id ? null : user.id)
                              }
                              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenuId === user.id && (
                              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => changeRole(user.id, 'staff')}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-emerald-50"
                                >
                                  <ShieldCheck size={16} className="text-emerald-700" />
                                  Make Staff
                                </button>

                                <button
                                  type="button"
                                  onClick={() => changeRole(user.id, 'student')}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-emerald-50"
                                >
                                  <ShieldOff size={16} className="text-slate-600" />
                                  Make Student
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeUser(user.id)}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </StaffGuard>
  );
}