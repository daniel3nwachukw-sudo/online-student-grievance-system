'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

import { auth, db } from '@/src/lib/firebase';
import SplashScreen from './SplashScreen';

const publicRoutes = ['/signin', '/signup', '/forgot-password'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
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

        const allowed =
          (role === 'admin' && pathname.startsWith('/dashboard/admin')) ||
          (role === 'staff' && pathname.startsWith('/dashboard/staff')) ||
          (role === 'student' && pathname.startsWith('/dashboard/student'));

        if (!allowed) {
          router.replace(
            role === 'admin'
              ? '/dashboard/admin'
              : role === 'staff'
              ? '/dashboard/staff'
              : '/dashboard/student'
          );
        }
      } catch (err) {
        console.error('AuthGate error:', err);
        router.replace('/signin');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router, pathname]);

  if (loading) return <SplashScreen />;

  return <>{children}</>;
}