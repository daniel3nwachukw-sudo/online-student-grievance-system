'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';

export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (snap.exists()) {
        setProfile(snap.data());
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { profile, loading };
}