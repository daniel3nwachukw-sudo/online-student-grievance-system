'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import {
  PenTool,
  ShieldAlert,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function SubmitPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/signin');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        router.replace('/signin');
        return;
      }

      const data = userSnap.data();
      const role = data.role;

      if (role === 'staff') {
        router.replace('/dashboard/staff');
        return;
      }

      if (role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }

      if (role !== 'student') {
        router.replace('/signin');
        return;
      }
    });

    return unsubscribe;
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Submit Complaint</h1>
          <p className="mt-2 text-slate-600">
            Choose how you want to submit your complaint.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => router.push('/dashboard/student/new')}
            className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <PenTool size={26} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Normal Complaint
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Submit with your name and profile details attached.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              Continue <ArrowRight size={16} />
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/student/anonymous')}
            className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <ShieldAlert size={26} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Anonymous Complaint
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Submit without showing your identity publicly.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
              Continue <ArrowRight size={16} />
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}