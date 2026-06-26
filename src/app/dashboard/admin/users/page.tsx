'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

import {
  auth,
  db,
} from '@/src/lib/firebase';

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

import {
  updateUserRole,
} from '@/src/lib/auth';

type UserData = {
  id: string;
  fullName: string;
  email: string;
  department?: string;
  level?: string;
  matricNumber?: string;
  phoneNumber?: string;
  gender?: string;
  college?: string;
  profileImage?: string;
  role: 'student' | 'staff' | 'admin';
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserData[]>([]);

  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.push('/signin');
          return;
        }

        const adminSnap = await getDoc(
          doc(db, 'users', user.uid)
        );

        if (!adminSnap.exists()) {
          router.push('/signin');
          return;
        }

        if (adminSnap.data().role !== 'admin') {
          router.push('/dashboard/student');
          return;
        }

        const unsubUsers = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            const list: UserData[] = [];

            snapshot.forEach((docSnap) => {
              const data = docSnap.data();

              list.push({
                id: docSnap.id,
                fullName: data.fullName || '',
                email: data.email || '',
                department: data.department || '',
                level: data.level || '',
                matricNumber: data.matricNumber || '',
                phoneNumber: data.phoneNumber || '',
                gender: data.gender || '',
                college: data.college || '',
                profileImage: data.profileImage || '',
                role: data.role || 'student',
              });
            });

            setUsers(list);
            setLoading(false);
          }
        );

        return unsubUsers;
      }
    );

    return () => unsubAuth();
  }, [router]);

  async function makeStudent(id: string) {
    await updateUserRole(id, 'student');
  }

  async function makeStaff(id: string) {
    await updateUserRole(id, 'staff');
  }

  async function makeAdmin(id: string) {
    await updateUserRole(id, 'admin');
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase();

      return (
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.department?.toLowerCase().includes(q) ||
        user.level?.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (u) => u.role === 'student'
  ).length;

  const totalStaff = users.filter(
    (u) => u.role === 'staff'
  ).length;

  const totalAdmins = users.filter(
    (u) => u.role === 'admin'
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Loading users...
        </h1>
      </main>
    );
  }

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        User Management
      </h1>
      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white border rounded-xl p-6 shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">
            {totalUsers}
          </h2>
        </div>

        <div className="bg-blue-50 border rounded-xl p-6 shadow">
          <p className="text-blue-700">Students</p>
          <h2 className="text-3xl font-bold mt-2">
            {totalStudents}
          </h2>
        </div>

        <div className="bg-yellow-50 border rounded-xl p-6 shadow">
          <p className="text-yellow-700">Staff</p>
          <h2 className="text-3xl font-bold mt-2">
            {totalStaff}
          </h2>
        </div>

        <div className="bg-green-50 border rounded-xl p-6 shadow">
          <p className="text-green-700">Admins</p>
          <h2 className="text-3xl font-bold mt-2">
            {totalAdmins}
          </h2>
        </div>

      </div>

      {/* Search */}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, department or level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Users Table */}

      <div className="overflow-x-auto rounded-xl border shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Email
              </th>

              <th className="text-left p-4">
                Department
              </th>

              <th className="text-left p-4">
                Level
              </th>

              <th className="text-left p-4">
                Role
              </th>

              <th className="text-left p-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="text-center p-8 text-gray-500"
                >
                  No users found.
                </td>

              </tr>

            ) : (

              filteredUsers.map((user) => (

                <tr
                  key={user.id}
                  className="border-t"
                >

                  <td className="p-4 font-medium">
                    {user.fullName}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">
                    {user.department}
                  </td>

                  <td className="p-4">
                    {user.level}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : user.role === 'staff'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </span>

                  </td>

                 <td className="p-4">

  <div className="flex flex-wrap gap-2">

    <button
      onClick={() => makeStudent(user.id)}
      disabled={user.role === 'student'}
      className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
    >
      Make Student
    </button>

    <button
      onClick={() => makeStaff(user.id)}
      disabled={user.role === 'staff'}
      className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
    >
      Make Staff
    </button>

    <button
      onClick={() => makeAdmin(user.id)}
      disabled={user.role === 'admin'}
      className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
    >
      Make Admin
    </button>

  </div>

</td>
                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </main>
  );
}