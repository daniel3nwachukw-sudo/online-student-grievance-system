'use client';

import { useEffect, useState } from 'react';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  response?: string;
  anonymous?: boolean;
  issueLevel?: string;
  issueSemester?: string;
  issueSession?: string;
  reporterId?: string;
  reporterName?: string;
};

export default function RejectComplaintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadComplaint = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'complaints', id));

        if (!snap.exists()) {
          setComplaint(null);
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
          anonymous: data.anonymous ?? false,
          issueLevel: data.issueLevel ?? '',
          issueSemester: data.issueSemester ?? '',
          issueSession: data.issueSession ?? '',
          reporterId: data.reporterId ?? '',
          reporterName: data.reporterName ?? '',
        });
        setResponse(data.response ?? '');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadComplaint();
  }, [id]);

  const updateComplaint = async (status: string) => {
    if (!complaint) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'complaints', complaint.id), {
        response,
        status,
      });
      router.push('/dashboard/staff/reject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!complaint) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, 'complaints', complaint.id));
      router.push('/dashboard/staff/reject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reject Complaint</h1>
        <p className="mt-2 text-gray-500">Review the complaint and take action.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-5 shadow-sm text-slate-500">
          Loading complaint...
        </div>
      ) : !complaint ? (
        <div className="rounded-xl border bg-white p-5 shadow-sm text-slate-500">
          Complaint not found.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Complaint Details</h2>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-slate-500">Title</p>
                <p className="font-medium text-slate-900">{complaint.title}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Description</p>
                <p className="text-slate-700">{complaint.description}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Category</p>
                <p className="text-slate-700">{complaint.category || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Department</p>
                <p className="text-slate-700">{complaint.department || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-medium text-blue-900">{complaint.status}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Reporter</p>
                <p className="text-slate-700">{complaint.reporterName || 'Anonymous'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Session</p>
                <p className="text-slate-700">{complaint.issueSession || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Semester</p>
                <p className="text-slate-700">{complaint.issueSemester || '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Write Response</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="Write your response..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => updateComplaint('Rejected')}
                  disabled={saving}
                  className="rounded-lg bg-blue-900 px-5 py-2 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Reject Response'}
                </button>

                <button
                  onClick={() => updateComplaint('In Progress')}
                  disabled={saving}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark In Progress
                </button>

                <button
                  onClick={() => updateComplaint('Resolved')}
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark Resolved
                </button>

                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="rounded-lg bg-slate-800 px-5 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}