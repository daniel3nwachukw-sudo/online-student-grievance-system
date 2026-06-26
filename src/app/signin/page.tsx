'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/src/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const user = await signIn(email, password);

      console.log('LOGGED IN UID:', user.uid);

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists()) {
        setMessage('User profile not found.');
        return;
      }

      const role = snap.data()?.role;

      console.log('USER ROLE:', role);

      if (role === 'admin') {
        router.push('/dashboard/admin');
        return;
      }

      if (role === 'staff') {
        router.push('/dashboard/staff');
        return;
      }

      if (role === 'student') {
        router.push('/dashboard/student');
        return;
      }

      setMessage('Invalid user role.');
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      setMessage('Login failed. Check email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold text-center">
          Sign In
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded w-full"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded w-full"
          required
        />

        {message && (
          <p className="text-red-500 text-sm text-center">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded w-full disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="text-center text-sm">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-blue-600 hover:underline"
          >
            Create Account
          </Link>
        </p>

        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </p>
      </form>
    </main>
  );
}