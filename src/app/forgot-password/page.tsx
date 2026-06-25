'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/src/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset link sent to your email.');
    } catch (error) {
      setMessage('Failed to send reset link. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="page-heading">Reset password</h1>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <label className="grid gap-2">
            <span className="font-medium">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="rounded-2xl border border-slate-300 p-4"
              required
            />
          </label>
          <button disabled={loading} className="rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800 disabled:opacity-60">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
        <p className="mt-6 text-slate-600">
          Back to <Link href="/signin" className="text-brand-700 hover:underline">login</Link>
        </p>
      </section>
    </main>
  );
}