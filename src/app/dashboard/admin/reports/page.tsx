'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
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
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Complaint[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        list.push({
          id: doc.id,
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

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="container mx-auto p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Complaint Management
        </h1>
      </div>

      {/* FILTERS */}

      <div className="grid md:grid-cols-2 gap-4 mb-6">

        <input
          type="text"
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg p-3"
        >
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>

      </div>

      {/* REPORTS */}

      <div className="bg-white rounded-xl shadow border">

        {filteredComplaints.length === 0 ? (
          <div className="p-6 text-gray-500">
            No complaints found.
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="border-b p-4"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="font-bold text-lg">
                    {c.title}
                  </h2>

                  <p className="text-gray-600">
                    {c.description}
                  </p>

                  <div className="text-sm text-gray-500 mt-2">
                    Category: {c.category || '-'}
                  </div>

                  <div className="text-sm text-gray-500">
                    Department: {c.department || '-'}
                  </div>

                  <div className="text-sm mt-1">
                    Status:
                    <span className="font-semibold ml-1">
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">

                  <Link
                    href={`/complaint/${c.id}`}
                    className="bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    View
                  </Link>

                  <button
                    onClick={async () => {
                      const ok = confirm(
                        'Delete this complaint?'
                      );

                      if (!ok) return;

                      await deleteComplaint(c.id);
                    }}
                    className="bg-red-600 text-white px-3 py-2 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>
            </div>
          ))
        )}

      </div>

    </main>
  );
}