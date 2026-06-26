'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { auth, db } from '@/src/lib/firebase';
import SplashScreen from './SplashScreen';

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        // ❌ No user → redirect immediately
        if (!user) {
          router.replace('/signin');
          return;
        }

        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists()) {
          router.replace('/signin');
          return;
        }

        const role = snap.data()?.role;

        // 🔥 role-based routing
        if (role === 'admin') {
          router.replace('/dashboard/admin');
        } else if (role === 'staff') {
          router.replace('/dashboard/staff');
        } else {
          router.replace('/dashboard/student');
        }

      } catch (err) {
        console.error('AuthGate error:', err);
        router.replace('/signin');
      } finally {
        // only mark ready AFTER decision cycle
        setLoading(false);
        setReady(true);
      }
    });

    return () => unsub();
  }, [router]);

  /**
   * 🔥 KEY FIX:
   * Keep splash until BOTH:
   * - auth checked
   * - routing decision made
   */
  if (loading || !ready) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}