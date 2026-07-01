'use client';

import Link from 'next/link';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { useComplaints } from '@/src/hooks/useComplaints';
import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';

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

  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Pending
    </span>
  );
}

export default function ResolvedComplaintsPage() {
  const { complaints, loading, error } = useComplaints({ mode: 'staff' });
  const typedComplaints = complaints as Complaint[];

  const resolvedComplaints = typedComplaints.filter(
    (c) => (c.status || '').toLowerCase() === 'resolved'
  );

  return (
    <DashboardLayout title="Resolved Complaints" sidebar={<StaffSidebar />}>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '...' : resolvedComplaints.length}</p>
            <p className="mt-1 text-sm text-slate-600">Resolved Complaints</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <ClipboardList size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '...' : typedComplaints.length}</p>
            <p className="mt-1 text-sm text-slate-600">Total Complaints</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <ArrowRight size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '...' : `${typedComplaints.length ? Math.round((resolvedComplaints.length / typedComplaints.length) * 100) : 0}%`}
            </p>
            <p className="mt-1 text-sm text-slate-600">Resolution Rate</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Resolved Cases</h2>
            <Link href="/dashboard/staff" className="text-sm font-medium text-emerald-700 hover:underline">
              Back to Dashboard
            </Link>
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
                </tr>
              </thead>
              <tbody>
                {resolvedComplaints.map((row) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && resolvedComplaints.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">No resolved complaints found.</p>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}