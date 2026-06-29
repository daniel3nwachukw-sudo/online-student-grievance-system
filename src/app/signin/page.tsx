'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const snap = await getDoc(doc(db, 'users', user.uid));
      const role = snap.exists() ? snap.data().role : 'student';

      if (role === 'staff') {
        router.push('/dashboard/staff');
      } else {
        router.push('/dashboard/student');
      }
    } catch (error: any) {
      setMessage(error?.message || 'Signin failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <section className="hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 to-emerald-950 p-8 text-white shadow-2xl lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <GraduationCap className="text-emerald-200" size={28} />
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight">
                Welcome back to your grievance dashboard.
              </h1>
              <p className="mt-4 max-w-md text-white/75">
                Sign in to continue as a student or staff member and manage complaints securely.
              </p>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Secure access</p>
              <p className="mt-2 text-lg font-semibold">Role-based dashboard entry</p>
              <p className="mt-1 text-sm text-white/75">
                Your Firestore role decides whether you enter the staff or student dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-2 text-slate-600">
              Enter your email and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Email Address</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Your password"
                  required
                />
              </div>
            </label>

            {message && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-sm text-slate-600">
              Don’t have an account?{' '}
              <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}