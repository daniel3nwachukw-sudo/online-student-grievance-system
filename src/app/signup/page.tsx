'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/src/lib/auth';

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      await signUp(
        email,
        password,
        role,
        fullName
      );

      if (role === 'staff') {
        router.push('/signin');
      } else {
        router.push('/profile');
      }
    } catch (error: any) {
      console.error('SIGNUP ERROR:', error);

      setMessage(
        error?.message || 'Unable to create account.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-center">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border p-3 rounded"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded"
            required
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as 'student' | 'staff')
            }
            className="border p-3 rounded"
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>

          {message && (
            <p className="text-red-600 text-sm">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </section>
    </main>
  );
}