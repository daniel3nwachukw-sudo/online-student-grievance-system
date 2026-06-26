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
} from 'firebase/firestore';
import LogoutButton from '@/src/components/LogoutButton';
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        router.push('/signin');
        return;
      }

      const data = userSnap.data();
      const role = data.role;

      // Protect dashboard by role
      if (role === 'staff') {
        router.push('/dashboard/staff');
        return;
      }

      if (role === 'admin') {
        router.push('/dashboard/admin');
        return;
      }

      if (role !== 'student') {
        router.push('/signin');
        return;
      }

      setStudentName(
        data.fullName ||
        user.displayName ||
        'Student'
      );

      setLoading(false);

      const q = query(
        collection(db, 'complaints'),
        where('reporterId', '==', user.uid)
      );

      const unsubscribeComplaints = onSnapshot(q, (snapshot) => {
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

      return unsubscribeComplaints;
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </main>
    );
  }

  return (
  <main className="p-6">

    {/* HEADER */}
    <div className="flex justify-between items-start mb-8">

      {/* LEFT SIDE */}
      <div>
        <h1 className="text-4xl font-bold">
          Welcome, {studentName}
        </h1>

        <p className="text-gray-500 mt-2">
          Student Grievance Dashboard
        </p>
      </div>

      {/* RIGHT SIDE */}
      <LogoutButton />

    </div>


      {/* Quick Actions */}

      <div className="flex gap-4 mb-8">

        <Link
          href="/dashboard/student/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl"
        >
          Lodge Complaint
        </Link>

        <Link
          href="/complaint"
          className="bg-green-600 text-white px-5 py-3 rounded-xl"
        >
          Track Complaint
        </Link>

      </div>

      {/* Statistics */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">
            Total Complaints
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {total}
          </h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <p className="text-green-700">
            Resolved
          </p>

          <h2 className="text-3xl font-bold text-green-700 mt-2">
            {resolved}
          </h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <p className="text-yellow-700">
            Pending
          </p>

          <h2 className="text-3xl font-bold text-yellow-700 mt-2">
            {pending}
          </h2>
        </div>

      </div>

      {/* Recent Complaints */}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">

        <h2 className="text-xl font-bold mb-4">
          Recent Complaints
        </h2>

        {complaints.length === 0 ? (
          <p className="text-gray-500">
            No complaints submitted yet.
          </p>
        ) : (
          <div className="space-y-4">

            {complaints.map((c) => (
              <div
                key={c.id}
                className="border rounded-xl p-4"
              >
                <div className="flex justify-between items-center">

                  <h3 className="font-semibold">
                    {c.title}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      c.status.toLowerCase() === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status}
                  </span>

                </div>

                <p className="text-gray-600 mt-2">
                  {c.description}
                </p>

                <Link
                  href={`/complaint/${c.id}`}
                  className="text-blue-600 text-sm mt-3 inline-block"
                >
                  View Details →
                </Link>

              </div>
            ))}

          </div>
        )}

      </div>

    </main>
  );
}