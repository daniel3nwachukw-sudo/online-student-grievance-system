'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists()) {
        router.push('/signin');
        return;
      }

      const role = snap.data()?.role;

      console.log('ROLE CHECK:', role);

      if (role !== 'admin') {
        router.push('/dashboard/student');
        return;
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <p className="text-gray-600 mt-2">
        Manage users and roles here.
      </p>
    </main>
  );
}