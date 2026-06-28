'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  createdAt?: any;
  anonymous?: boolean;
  fullName?: string;
  email?: string;
};

export default function PendingPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

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

        const pendingOnly = list
          .filter((item) => item.status === 'Pending')
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
            const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
            return bTime - aTime;
          });

        setComplaints(pendingOnly);
        setLoading(false);
      },
      () => {
        setComplaints([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const total = useMemo(() => complaints.length, [complaints]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pending Complaints</h1>
        <p className="mt-2 text-gray-500">
          Complaints that are waiting for staff attention.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 py-3 text-sm text-slate-500">
          Total pending: {total}
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">Loading pending complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-6 text-slate-500">No pending complaints found.</div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="border-b border-slate-200 p-4 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Pending
                </span>
              </div>

              <p className="mt-1 text-slate-700">{c.description}</p>

              <div className="mt-2 text-sm text-slate-500">
                Category: {c.category || '-'}
              </div>
              <div className="text-sm text-slate-500">
                Department: {c.department || '-'}
              </div>
              <div className="text-sm text-slate-500">
                Reporter: {c.anonymous ? 'Anonymous' : c.fullName || c.email || 'Unknown'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}