'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title?: string;
  status?: string;
  category?: string;
  department?: string;
  createdAt?: any;
};

export default function Page() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Complaint, 'id'>),
        }));
        setComplaints(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const rejected = complaints.filter((c) => c.status === 'Rejected').length;

    const byCategory = complaints.reduce<Record<string, number>>((acc, c) => {
      const key = c.category || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { total, pending, resolved, rejected, topCategories };
  }, [complaints]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report Analytics</h1>
        <p className="text-sm text-slate-500">Live summary of complaints from Firestore.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Total Complaints</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</h2>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">{stats.pending}</h2>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Resolved</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-600">{stats.resolved}</h2>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Rejected</p>
          <h2 className="mt-2 text-3xl font-bold text-rose-600">{stats.rejected}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Top Categories</h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : stats.topCategories.length === 0 ? (
              <p className="text-sm text-slate-500">No complaints found.</p>
            ) : (
              stats.topCategories.map(([name, value]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{name}</span>
                    <span className="text-slate-500">{value}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.max(10, (value / Math.max(1, stats.total)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Recent Records</h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-sm text-slate-500">No records available.</p>
            ) : (
              complaints.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.title || 'Untitled complaint'}</p>
                    <p className="text-xs text-slate-500">{c.department || 'No department'}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{c.status || 'Unknown'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}