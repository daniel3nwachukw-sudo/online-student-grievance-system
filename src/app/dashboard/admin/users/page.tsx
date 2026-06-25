'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/src/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type User = {
  id: string;
  email?: string;
  fullName?: string;
  role?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists() || snap.data().role !== 'admin') {
        router.push('/dashboard/student');
        return;
      }

      loadUsers();
    });

    return () => unsub();
  }, [router]);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));

    const list: User[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as User[];

    setUsers(list);
    setLoading(false);
  };

  const promoteToStaff = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      role: 'staff',
    });

    loadUsers();
  };

  const demoteToStudent = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      role: 'student',
    });

    loadUsers();
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Admin Users Panel
      </h1>

      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {u.fullName || 'No Name'}
              </p>
              <p className="text-sm text-gray-600">
                {u.email}
              </p>
              <p className="text-sm mt-1">
                Role: <b>{u.role}</b>
              </p>
            </div>

            <div className="flex gap-2">
              {u.role !== 'staff' && (
                <button
                  onClick={() => promoteToStaff(u.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Promote
                </button>
              )}

              {u.role === 'staff' && (
                <button
                  onClick={() => demoteToStudent(u.id)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Demote
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}