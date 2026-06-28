'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function RespondPage() {
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
          list.push({
            id: docSnap.id,
            title: data.title ?? '',
            description: data.description ?? '',
            category: data.category ?? '',
            department: data.department ?? '',
            status: data.status ?? 'Pending',
            response: data.response ?? '',
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
        <h1 className="text-3xl font-bold text-slate-900">Respond to Complaints</h1>
        <p className="mt-2 text-gray-500">Select a complaint to review and respond.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-6 text-slate-500">No complaints found.</div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="border-b border-slate-200 p-4 last:border-b-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
                  <p className="mt-1 text-slate-700">{c.description}</p>

                  <div className="mt-2 text-sm text-slate-500">
                    Category: {c.category || '-'}
                  </div>
                  <div className="text-sm text-slate-500">
                    Department: {c.department || '-'}
                  </div>
                  <div className="text-sm text-slate-700">
                    Status: <span className="font-medium text-blue-900">{c.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/staff/respond/${c.id}`}
                    className="rounded-lg bg-blue-900 px-3 py-2 text-white transition hover:bg-blue-800"
                  >
                    Respond
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}