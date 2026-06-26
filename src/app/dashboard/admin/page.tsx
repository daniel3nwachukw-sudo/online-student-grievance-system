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

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists()) {
          router.push('/signin');
          return;
        }

        const role = snap.data()?.role;

        console.log('ROLE CHECK:', role);

        if (role === 'admin') {
          setLoading(false);
          return;
        }

        if (role === 'staff') {
          router.push('/dashboard/staff');
          return;
        }

        if (role === 'student') {
          router.push('/dashboard/student');
          return;
        }

        router.push('/signin');
      } catch (error) {
        console.error('Admin role check failed:', error);
        router.push('/signin');
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <p className="text-gray-600 mt-2">
        Manage users, staff, complaints, and system settings.
      </p>
    </main>
  );
}