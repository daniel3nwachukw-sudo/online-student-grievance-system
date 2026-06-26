'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';

import {
  updateComplaintStatus,
  deleteComplaint,
} from '@/src/lib/user';
import LogoutButton from '@/src/components/LogoutButton';

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
  reporterId?: string;
  createdAt?: any;
};

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Complaint[] = [];

      let p = 0;
      let ip = 0;
      let r = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const complaint: Complaint = {
          id: docSnap.id,
          title: data.title ?? '',
          description: data.description ?? '',
          status: data.status ?? 'Pending',
          reporterId: data.reporterId ?? '',
          createdAt: data.createdAt,
        };

        list.push(complaint);

        const status = complaint.status.toLowerCase();

        if (status === 'pending') p++;
        else if (status === 'in progress') ip++;
        else if (status === 'resolved') r++;
      });

      setComplaints(list);
      setTotal(snapshot.size);
      setPending(p);
      setInProgress(ip);
      setResolved(r);
    });

    return () => unsub();
  }, []);

  return (
  <main className="p-6">

    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">
        Staff Dashboard
      </h1>

      <LogoutButton />
    </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-gray-500">
            Total Complaints
          </h2>
          <p className="text-3xl font-bold">
            {total}
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-gray-500">
            Pending
          </h2>
          <p className="text-3xl font-bold">
            {pending}
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-gray-500">
            In Progress
          </h2>
          <p className="text-3xl font-bold">
            {inProgress}
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-gray-500">
            Resolved
          </h2>
          <p className="text-3xl font-bold">
            {resolved}
          </p>
        </div>

      </div>

      {/* LATEST COMPLAINTS */}
      <div className="border rounded-lg p-6 shadow mb-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Latest 5 Complaints
          </h2>

          <Link
            href="/dashboard/admin/reports"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            View All Reports
          </Link>
        </div>

        {complaints.length === 0 ? (
          <p className="text-gray-500">
            No complaints available.
          </p>
        ) : (
          <div className="space-y-4">

            {complaints.map((c) => {

              const status = c.status.toLowerCase();

              return (
                <div
                  key={c.id}
                  className="border p-4 rounded-lg bg-white"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {c.title}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {c.description}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : status === 'in progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">

                    <Link
                      href={`/complaint/${c.id}`}
                      className="bg-gray-700 text-white px-3 py-1 rounded"
                    >
                      View
                    </Link>

                    <button
                      onClick={() =>
                        updateComplaintStatus(
                          c.id,
                          'In Progress',
                          c.reporterId
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() =>
                        updateComplaintStatus(
                          c.id,
                          'Resolved',
                          c.reporterId
                        )
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Resolved
                    </button>

                    <button
                      onClick={() =>
                        deleteComplaint(c.id)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <div className="border rounded-lg p-6 shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Notifications
        </h2>

        <p className="text-gray-500">
          Complaint status updates and student notifications will appear here.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="border rounded-lg p-6 shadow">

        <h2 className="text-xl font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="flex gap-4">

          <Link
            href="/dashboard/admin/reports"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Complaint Management
          </Link>

          <Link
            href="/notifications"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Notifications
          </Link>

        </div>

      </div>

    </main>
  );
}