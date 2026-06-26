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
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/signin');
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists()) {
        router.replace('/signin');
        setLoading(false);
        return;
      }

      const role = snap.data()?.role;

      if (role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (role === 'staff') {
        router.replace('/dashboard/staff');
      } else {
        router.replace('/dashboard/student');
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) return <SplashScreen />;

  return <>{children}</>;
}