'use client';

import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { deleteComplaint } from '@/src/lib/user';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  reporterId?: string;
};

export default function AdminReportsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Complaint[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        list.push({
          id: docSnap.id,
          title: data.title ?? '',
          description: data.description ?? '',
          category: data.category ?? '',
          department: data.department ?? '',
          status: data.status ?? 'Pending',
          reporterId: data.reporterId ?? '',
        });
      });

      setComplaints(list);
    });

    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'complaints', id), { status });
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : c.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statusButtons = ['All', 'Pending', 'In Progress', 'Resolved'];

  return (
    <DashboardLayout title="Staff Dashboard" sidebar={<StaffSidebar />}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Complaint Management</h1>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
        />

        <div className="flex flex-wrap gap-2">
          {statusButtons.map((status) => {
            const active = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg border-2 px-4 py-2 font-medium transition ${
                  active
                    ? 'border-blue-900 bg-blue-900 text-white'
                    : 'border-blue-900 bg-white text-blue-900 hover:bg-blue-50'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow">
        {filteredComplaints.length === 0 ? (
          <div className="p-6 text-slate-500">No complaints found.</div>
        ) : (
          filteredComplaints.map((c) => (
            <div key={c.id} className="border-b border-slate-200 p-4 last:border-b-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900">{c.title}</h2>
                  <p className="mt-1 text-slate-700">{c.description}</p>

                  <div className="mt-2 text-sm text-slate-500">Category: {c.category || '-'}</div>
                  <div className="text-sm text-slate-500">Department: {c.department || '-'}</div>
                  <div className="mt-1 text-sm text-slate-700">
                    Status: <span className="ml-1 font-semibold text-blue-900">{c.status}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(c.id, 'In Progress')}
                      className="rounded-lg border border-blue-900 bg-blue-900 px-3 py-2 text-white transition hover:bg-blue-800"
                    >
                      Attend Report
                    </button>

                    <button
                      onClick={() => updateStatus(c.id, 'Pending')}
                      className="rounded-lg border border-blue-900 bg-white px-3 py-2 text-blue-900 transition hover:bg-blue-50"
                    >
                      Mark Pending
                    </button>

                    <button
                      onClick={() => updateStatus(c.id, 'Resolved')}
                      className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/complaint/${c.id}`}
                    className="rounded-lg border border-blue-900 bg-blue-900 px-3 py-2 text-white transition hover:bg-blue-800"
                  >
                    View
                  </Link>

                  <button
                    onClick={async () => {
                      const ok = confirm('Delete this complaint?');
                      if (!ok) return;
                      await deleteComplaint(c.id);
                    }}
                    className="rounded-lg border border-red-700 bg-white px-3 py-2 text-red-700 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}