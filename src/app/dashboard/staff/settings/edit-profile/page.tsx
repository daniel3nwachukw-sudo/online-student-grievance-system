'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditStaffProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Staff');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setFullName(user.displayName || '');
      setEmail(user.email || '');

      const snap = await getDoc(doc(db, 'staffProfiles', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFullName(data.fullName || user.displayName || '');
        setEmail(data.email || user.email || '');
        setPhone(data.phone || '');
        setDepartment(data.department || '');
        setRole(data.role || 'Staff');
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setSaving(true);
    setMessage('');

    try {
      await updateProfile(auth.currentUser, {
        displayName: fullName,
      });

      await setDoc(
        doc(db, 'staffProfiles', auth.currentUser.uid),
        {
          fullName,
          email,
          phone,
          department,
          role,
          uid: auth.currentUser.uid,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Edit Staff Profile" sidebar={<StaffSidebar />}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Staff Profile</h1>
        <p className="mt-2 text-gray-500">Update your staff account details here.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-gray-500 shadow">
          Loading profile...
        </div>
      ) : (
        <div className="max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Enter department"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Enter role"
            />
          </div>

          {message && <p className="text-sm font-medium text-green-700">{message}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-900 px-5 py-3 text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}