'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import {
  UserRound,
  Mail,
  Phone,
  School,
  BookOpen,
  Hash,
  Save,
} from 'lucide-react';

type ProfileData = {
  fullName?: string;
  email?: string;
  matricNo?: string;
  department?: string;
  level?: string;
  semester?: string;
  session?: string;
  phone?: string;
  role?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    matricNo: '',
    department: '',
    level: '',
    semester: '',
    session: '',
    phone: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        router.replace('/signin');
        return;
      }

      setUserId(user.uid);

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) {
        setLoading(false);
        router.replace('/signin');
        return;
      }

      const data = snap.data() as ProfileData;

      if (data.role === 'staff') {
        setLoading(false);
        router.replace('/dashboard/staff');
        return;
      }

      if (data.role === 'admin') {
        setLoading(false);
        router.replace('/dashboard/admin');
        return;
      }

      setProfile({
        fullName: data.fullName || user.displayName || '',
        email: data.email || user.email || '',
        matricNo: data.matricNo || '',
        department: data.department || '',
        level: data.level || '',
        semester: data.semester || '',
        session: data.session || '',
        phone: data.phone || '',
      });

      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'users', userId), profile);
      setMessage('Profile updated successfully.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-slate-600">
            Update your personal and academic details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <InputField icon={UserRound} label="Full Name" name="fullName" value={profile.fullName} onChange={handleChange} />
          <InputField icon={Mail} label="Email" name="email" value={profile.email} onChange={handleChange} />
          <InputField icon={Hash} label="Matric No." name="matricNo" value={profile.matricNo} onChange={handleChange} />
          <InputField icon={School} label="Department" name="department" value={profile.department} onChange={handleChange} />
          <InputField icon={BookOpen} label="Level" name="level" value={profile.level} onChange={handleChange} />
          <InputField icon={BookOpen} label="Semester" name="semester" value={profile.semester} onChange={handleChange} />
          <InputField icon={BookOpen} label="Session" name="session" value={profile.session} onChange={handleChange} />
          <InputField icon={Phone} label="Phone" name="phone" value={profile.phone} onChange={handleChange} />

          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              These details are used for your complaint records.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {message ? (
            <p className="md:col-span-2 text-sm text-slate-600">{message}</p>
          ) : null}
        </form>
      </div>
    </main>
  );
}

function InputField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <Icon size={18} className="text-slate-400" />
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent outline-none"
        />
      </div>
    </label>
  );
}