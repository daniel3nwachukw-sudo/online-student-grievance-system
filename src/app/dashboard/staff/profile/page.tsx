'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type StaffProfile = {
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
  photoURL?: string;
};

export default function StaffProfilePage() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<StaffProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setDisplayName(user.displayName || '');
      setEmail(user.email || '');

      const snap = await getDoc(doc(db, 'staffProfiles', user.uid));
      if (snap.exists()) {
        setProfile(snap.data() as StaffProfile);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const name = profile?.fullName || displayName || 'Staff';

  return (
    <DashboardLayout title="Staff Profile" sidebar={<StaffSidebar />}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Staff Profile</h1>
        <p className="mt-2 text-gray-500">View your staff account details.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-gray-500 shadow">
          Loading profile...
        </div>
      ) : (
        <div className="max-w-2xl rounded-xl border bg-white p-6 shadow">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-2xl font-bold text-white">
              {name.charAt(0).toUpperCase() || 'S'}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
              <p className="text-gray-500">{profile?.role || 'Staff Member'}</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-800">
            <div>
              <span className="font-semibold">Email:</span> {profile?.email || email || '-'}
            </div>

            <div>
              <span className="font-semibold">Phone:</span> {profile?.phone || '-'}
            </div>

            <div>
              <span className="font-semibold">Department:</span> {profile?.department || '-'}
            </div>

            <div>
              <span className="font-semibold">Role:</span> {profile?.role || 'Staff'}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}