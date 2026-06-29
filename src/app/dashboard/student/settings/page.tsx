'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import {
  Settings2,
  BellRing,
  ShieldCheck,
  MoonStar,
  Save,
  UserRound,
  Mail,
  Phone,
  School,
  BookOpen,
} from 'lucide-react';

type SettingsData = {
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  level?: string;
  semester?: string;
  session?: string;
  receiveNotifications?: boolean;
  darkMode?: boolean;
  anonymousDefault?: boolean;
  role?: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsData>({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    level: '',
    semester: '',
    session: '',
    receiveNotifications: true,
    darkMode: false,
    anonymousDefault: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/signin');
        return;
      }

      setUserId(user.uid);

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        router.replace('/signin');
        return;
      }

      const data = userSnap.data() as SettingsData;

      if (data.role === 'staff') {
        router.replace('/dashboard/staff');
        return;
      }

      if (data.role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }

      setSettings({
        fullName: data.fullName || user.displayName || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        department: data.department || '',
        level: data.level || '',
        semester: data.semester || '',
        session: data.session || '',
        receiveNotifications:
          typeof data.receiveNotifications === 'boolean'
            ? data.receiveNotifications
            : true,
        darkMode: typeof data.darkMode === 'boolean' ? data.darkMode : false,
        anonymousDefault:
          typeof data.anonymousDefault === 'boolean' ? data.anonymousDefault : false,
      });

      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        fullName: settings.fullName,
        email: settings.email,
        phone: settings.phone,
        department: settings.department,
        level: settings.level,
        semester: settings.semester,
        session: settings.session,
        receiveNotifications: settings.receiveNotifications,
        darkMode: settings.darkMode,
        anonymousDefault: settings.anonymousDefault,
      });

      setMessage('Settings saved successfully.');
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Settings2 size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="mt-1 text-slate-600">
                Manage your account preferences and complaint defaults.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              icon={UserRound}
              label="Full Name"
              name="fullName"
              value={settings.fullName || ''}
              onChange={handleChange}
            />
            <Field
              icon={Mail}
              label="Email"
              name="email"
              value={settings.email || ''}
              onChange={handleChange}
            />
            <Field
              icon={Phone}
              label="Phone"
              name="phone"
              value={settings.phone || ''}
              onChange={handleChange}
            />
            <Field
              icon={School}
              label="Department"
              name="department"
              value={settings.department || ''}
              onChange={handleChange}
            />
            <Field
              icon={BookOpen}
              label="Level"
              name="level"
              value={settings.level || ''}
              onChange={handleChange}
            />
            <Field
              icon={BookOpen}
              label="Semester"
              name="semester"
              value={settings.semester || ''}
              onChange={handleChange}
            />
            <Field
              icon={BookOpen}
              label="Session"
              name="session"
              value={settings.session || ''}
              onChange={handleChange}
            />
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl bg-slate-50 p-5">
            <ToggleRow
              icon={BellRing}
              title="Receive notifications"
              description="Get updates when staff respond to your complaints."
              name="receiveNotifications"
              checked={Boolean(settings.receiveNotifications)}
              onChange={handleChange}
            />

            <ToggleRow
              icon={MoonStar}
              title="Dark mode preference"
              description="Save your preferred theme setting."
              name="darkMode"
              checked={Boolean(settings.darkMode)}
              onChange={handleChange}
            />

            <ToggleRow
              icon={ShieldCheck}
              title="Anonymous complaint default"
              description="Make anonymous submission the default option."
              name="anonymousDefault"
              checked={Boolean(settings.anonymousDefault)}
              onChange={handleChange}
            />
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              {message}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
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
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-500">
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

function ToggleRow({
  icon: Icon,
  title,
  description,
  name,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <Icon size={18} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-violet-600" />
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </label>
    </div>
  );
}