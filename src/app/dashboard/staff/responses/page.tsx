'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { useComplaints } from '@/src/hooks/useComplaints';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import {
  MessageSquareText,
  CheckCircle2,
  Clock3,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

type Complaint = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  response?: string;
  anonymous?: boolean;
  isAnonymous?: boolean;
  reporterName?: string;
  fullName?: string;
  name?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
};

function formatDate(value?: { seconds?: number; nanoseconds?: number } | null) {
  if (!value?.seconds) return '-';

  const date = new Date(value.seconds * 1000);

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status?: string }) {
  const value = (status || '').toLowerCase();

  if (value === 'resolved') {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Resolved
      </span>
    );
  }

  if (value === 'rejected') {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Pending
    </span>
  );
}

export default function StaffResponsesPage() {
  const { complaints, loading, error } = useComplaints({ mode: 'staff' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const typedComplaints = complaints as Complaint[];

  const respondedComplaints = useMemo(
    () => typedComplaints.filter((c) => (c.response || '').trim().length > 0),
    [typedComplaints]
  );

  const totalResponses = respondedComplaints.length;
  const resolvedCount = typedComplaints.filter((c) => (c.status || '').toLowerCase() === 'resolved').length;

  async function handleDelete(reportId: string) {
    const ok = confirm('Are you sure you want to delete this complaint?');
    if (!ok) return;

    try {
      setDeletingId(reportId);
      await deleteDoc(doc(db, 'complaints', reportId));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardLayout title="Respond to Complaints" sidebar={<StaffSidebar />}>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Staff replies</p>
            <h1 className="text-2xl font-bold text-slate-900">Respond to Complaints</h1>
          </div>

          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <MessageSquareText size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '...' : totalResponses}</p>
            <p className="mt-1 text-sm text-slate-600">Complaints with Replies</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '...' : resolvedCount}</p>
            <p className="mt-1 text-sm text-slate-600">Resolved Complaints</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
              <Clock3 size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '...' : Math.max(typedComplaints.length - totalResponses, 0)}
            </p>
            <p className="mt-1 text-sm text-slate-600">Still Pending</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Complaints with Responses</h2>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b">
                  <th className="py-3 pr-4 font-medium">Complainant</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Subject</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Report Date</th>
                  <th className="py-3 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {respondedComplaints.map((row) => {
                  const complainant =
                    row.anonymous || row.isAnonymous
                      ? 'Anonymous'
                      : row.reporterName || row.fullName || row.name || 'Anonymous';

                  return (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="py-4 pr-4 font-medium text-slate-900">{complainant}</td>
                      <td className="py-4 pr-4 text-slate-700">{row.category || '-'}</td>
                      <td className="py-4 pr-4 text-slate-700">{row.title || '-'}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-4 pr-4 text-slate-700">{formatDate(row.createdAt)}</td>
                      <td className="py-4 pr-4">
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          {deletingId === row.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && respondedComplaints.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">No responded complaints found.</p>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}