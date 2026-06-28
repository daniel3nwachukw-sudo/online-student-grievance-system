'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  department?: string;
  status?: string;
  response?: string;
  anonymous?: boolean;
  fullName?: string;
  email?: string;
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadComplaint = async () => {
      if (!id) return;

      const ref = doc(db, 'complaints', id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setComplaint({
          id: snap.id,
          title: data.title,
          description: data.description,
          category: data.category,
          department: data.department,
          status: data.status,
          response: data.response,
          anonymous: data.anonymous ?? false,
          fullName: data.fullName ?? '',
          email: data.email ?? '',
        });
        setResponse(data.response || '');
      } else {
        setComplaint(null);
      }

      setLoading(false);
    };

    loadComplaint().catch(() => setLoading(false));
  }, [id]);

  const saveResponse = async () => {
    if (!id) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, 'complaints', id), {
        response,
        status: 'Resolved',
      });

      setComplaint((prev) => (prev ? { ...prev, response, status: 'Resolved' } : prev));
    } finally {
      setSaving(false);
    }
  };

  const removeComplaint = async () => {
    if (!id) return;
    await deleteDoc(doc(db, 'complaints', id));
    router.push('/dashboard/staff/report-analytics');
  };

  if (loading) {
    return <div className="p-6 text-slate-600">Loading...</div>;
  }

  if (!complaint) {
    return <div className="p-6 text-slate-600">Complaint not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-xl border border-white/10 bg-[#071b18] p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">{complaint.title || 'Untitled complaint'}</h1>
        <p className="mt-2 text-sm text-white/70">
          {complaint.category || 'No category'} • {complaint.department || 'No department'}
        </p>

        <div className="mt-4 rounded-lg bg-white/5 p-4 text-sm text-white/85">
          {complaint.description || 'No description available.'}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-emerald-200">
            Status: {complaint.status || 'Unknown'}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
            Reporter: {complaint.anonymous ? 'Anonymous' : complaint.fullName || complaint.email || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-900">Response</h2>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="mt-4 min-h-[160px] w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-emerald-600"
          placeholder="Write your response here..."
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={saveResponse}
            disabled={saving}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Response'}
          </button>

          <button
            onClick={removeComplaint}
            className="rounded-lg bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}