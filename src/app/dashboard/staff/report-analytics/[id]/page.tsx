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
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');

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
        });
        setResponse(data.response || '');
      }

      setLoading(false);
    };

    loadComplaint();
  }, [id]);

  const saveResponse = async () => {
    if (!id) return;
    await updateDoc(doc(db, 'complaints', id), {
      response,
      status: 'Resolved',
    });
    setComplaint((prev) => (prev ? { ...prev, response, status: 'Resolved' } : prev));
  };

  const removeComplaint = async () => {
    if (!id) return;
    await deleteDoc(doc(db, 'complaints', id));
    router.push('/dashboard/staff/report-analytics');
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!complaint) {
    return <div className="p-6">Complaint not found.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">{complaint.title || 'Untitled complaint'}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {complaint.category || 'No category'} • {complaint.department || 'No department'}
        </p>

        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          {complaint.description || 'No description available.'}
        </div>

        <p className="mt-4 text-sm">
          Status: <span className="font-semibold">{complaint.status || 'Unknown'}</span>
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Response</h2>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="min-h-[160px] w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
          placeholder="Write your response here..."
        />

        <div className="flex gap-3">
          <button
            onClick={saveResponse}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save Response
          </button>
          <button
            onClick={removeComplaint}
            className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}