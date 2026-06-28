'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  response?: string;
};

export default function RejectedPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Complaint[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const status = String(data.status ?? '').trim();

          if (status.toLowerCase() === 'rejected') {
            list.push({
              id: docSnap.id,
              title: data.title ?? '',
              description: data.description ?? '',
              category: data.category ?? '',
              department: data.department ?? '',
              status: data.status ?? 'Rejected',
              response: data.response ?? '',
            });
          }
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
        <h1 className="text-3xl font-bold text-slate-900">Rejected Complaints</h1>
        <p className="mt-2 text-gray-500">Complaints that were rejected.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500">Loading rejected complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-6 text-slate-500">No rejected complaints found.</div>
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
              <div className="text-sm text-red-700">
                Status: {c.status || 'Rejected'}
              </div>
              {c.response ? (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  Response: {c.response}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}