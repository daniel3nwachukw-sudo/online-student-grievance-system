'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.push('/signin');
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists() || snap.data().role !== 'admin') {
        router.push('/dashboard/student');
        return;
      }
    };

    checkAccess();
  }, [router]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <p className="text-gray-600 mt-2">
        Manage users and roles here.
      </p>
    </main>
  );
}