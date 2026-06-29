'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  response?: string;
};

export default function ComplaintResponsePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const ref = doc(db, 'complaints', id);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setComplaint(null);
          setLoading(false);
          setError('Complaint not found.');
          return;
        }

        const data = snap.data();
        setComplaint({
          id: snap.id,
          title: data.title ?? '',
          description: data.description ?? '',
          category: data.category ?? '',
          department: data.department ?? '',
          status: data.status ?? 'Pending',
          response: data.response ?? '',
        });
        setResponse(data.response ?? '');
        setStatus(data.status ?? 'In Progress');
        setLoading(false);
        setError('');
      },
      () => {
        setComplaint(null);
        setLoading(false);
        setError('Failed to load complaint.');
      }
    );

    return () => unsub();
  }, [id]);

  async function handleSave() {
    if (!id) return;

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await updateDoc(doc(db, 'complaints', id), {
        response,
        status,
        updatedAt: new Date(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save response.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Respond to Complaint" sidebar={<StaffSidebar />}>
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Complaint Response</h1>
          <p className="mt-2 text-slate-600">
            Review the complaint and send your response.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border bg-white p-6 text-slate-500 shadow-sm">
            Loading complaint...
          </div>
        ) : complaint ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{complaint.title}</h2>
              <p className="mt-3 text-slate-700">{complaint.description}</p>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-800">Category:</span> {complaint.category || '-'}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-800">Department:</span> {complaint.department || '-'}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-800">Current Status:</span> {complaint.status || 'Pending'}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-700" size={20} />
                <h2 className="text-xl font-semibold text-slate-900">Write Response</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Update Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-emerald-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Response
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={8}
                    placeholder="Write your response here..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Save Response
                    </>
                  )}
                </button>

                {saved ? (
                  <p className="text-sm font-medium text-emerald-700">Response saved successfully.</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border bg-white p-6 text-slate-500 shadow-sm">
            Complaint not found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}