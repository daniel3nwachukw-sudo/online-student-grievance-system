'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StudentSidebar from '@/src/components/dashboard/StudentSidebar';
import { auth, db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let unsubscribeComplaints: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/signin');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        router.replace('/signin');
        return;
      }

      const data = userSnap.data();
      const role = data.role;

      if (role === 'staff') {
        router.replace('/dashboard/staff');
        return;
      }

      if (role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }

      if (role !== 'student') {
        router.replace('/signin');
        return;
      }

      setStudentName(data.fullName || user.displayName || 'Student');
      setLoading(false);

      const q = query(
        collection(db, 'complaints'),
        where('reporterId', '==', user.uid)
      );

      unsubscribeComplaints = onSnapshot(q, (snapshot) => {
        const list: Complaint[] = [];
        let resolvedCount = 0;
        let pendingCount = 0;

        snapshot.forEach((d) => {
          const complaint = d.data();
          const status = complaint.status || 'Pending';

          list.push({
            id: d.id,
            title: complaint.title || '',
            description: complaint.description || '',
            status,
          });

          if (status.toLowerCase() === 'resolved') {
            resolvedCount++;
          } else {
            pendingCount++;
          }
        });

        setComplaints(list);
        setTotal(snapshot.size);
        setResolved(resolvedCount);
        setPending(pendingCount);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeComplaints) unsubscribeComplaints();
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard" sidebar={<StudentSidebar />}>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome, {studentName}</h1>
          <p className="mt-2 text-gray-500">Student Grievance Dashboard</p>
        </div>
      </div>

      <div className="mb-8 flex gap-4">
        <Link
          href="/dashboard/student/new"
          className="rounded-xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
        >
          Lodge Complaint
        </Link>

        <Link
          href="/complaint"
          className="rounded-xl bg-slate-800 px-5 py-3 text-white hover:bg-slate-900"
        >
          Track Complaint
        </Link>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Total Complaints</p>
          <h2 className="mt-2 text-3xl font-bold">{total}</h2>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-green-700">Resolved</p>
          <h2 className="mt-2 text-3xl font-bold text-green-700">{resolved}</h2>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-yellow-700">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-700">{pending}</h2>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Recent Complaints</h2>

        {complaints.length === 0 ? (
          <p className="text-gray-500">No complaints submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      c.status.toLowerCase() === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="mt-2 text-gray-600">{c.description}</p>

                <Link
                  href={`/complaint/${c.id}`}
                  className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}