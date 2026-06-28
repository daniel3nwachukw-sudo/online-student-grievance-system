'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  createdAt?: string;
};

export default function PendingPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      where('status', '==', 'Pending'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
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
            createdAt: data.createdAt ?? '',
          });
        });

        setComplaints(list);
        setLoading(false);
      },
      () => {
        setComplaints([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pending Complaints</h1>
        <p className="mt-2 text-gray-500">
          Complaints that are waiting for staff attention.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500">Loading pending complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-6 text-slate-500">No pending complaints found.</div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="border-b border-slate-200 p-4 last:border-b-0">
              <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
              <p className="mt-1 text-slate-700">{c.description}</p>

              <div className="mt-2 text-sm text-slate-500">
                Category: {c.category || '-'}
              </div>
              <div className="text-sm text-slate-500">
                Department: {c.department || '-'}
              </div>
              <div className="text-sm text-yellow-700">
                Status: {c.status || 'Pending'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}