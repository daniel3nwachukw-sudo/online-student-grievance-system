'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import AdminSidebar from '@/src/components/dashboard/AdminSidebar';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  department?: string;
  status?: string;
  createdAt?: any;
  anonymous?: boolean;
  fullName?: string;
  email?: string;
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'complaints'),
      (snapshot) => {
        const list: Complaint[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title ?? '',
            description: data.description ?? '',
            category: data.category ?? '',
            department: data.department ?? '',
            status: data.status ?? 'Pending',
            createdAt: data.createdAt ?? null,
            anonymous: data.anonymous ?? false,
            fullName: data.fullName ?? '',
            email: data.email ?? '',
          };
        });

        const sorted = list.sort((a, b) => {
          const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
          return bTime - aTime;
        });

        setComplaints(sorted);
        setLoading(false);
      },
      () => {
        setComplaints([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredComplaints = useMemo(() => {
    const q = search.toLowerCase().trim();

    return complaints.filter((c) => {
      const status = (c.status || '').trim().toLowerCase();
      const matchesStatus =
        statusFilter === 'All' || status === statusFilter.toLowerCase();

      const reporter = c.anonymous
        ? 'anonymous'
        : `${c.fullName || ''} ${c.email || ''}`.trim();

      const matchesSearch =
        !q ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.department || '').toLowerCase().includes(q) ||
        status.includes(q) ||
        reporter.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [complaints, search, statusFilter]);

  return (
    <DashboardLayout title="Complaint Management" sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complaint Management</h1>
          <p className="mt-2 text-gray-500">
            View, monitor and manage all complaints submitted by students.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Complaint</th>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-slate-500" colSpan={5}>
                    Loading complaints...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={5}>
                    No complaints available yet.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">
                        {c.title || 'Untitled'}
                      </div>
                      <div className="text-sm text-slate-500">{c.category || '-'}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {c.anonymous ? 'Anonymous' : c.fullName || c.email || 'Unknown'}
                    </td>
                    <td className="p-4 text-slate-700">{c.department || '-'}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        {c.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">
                      <a
                        href={`/dashboard/staff/report-analytics/${c.id}`}
                        className="text-emerald-700 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}