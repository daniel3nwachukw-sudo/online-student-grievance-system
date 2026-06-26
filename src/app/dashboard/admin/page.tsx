'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LogoutButton from '@/src/components/LogoutButton';
import {
  collection,
  query,
  limit,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

type UserData = {
  id: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
};

type ComplaintData = {
  id: string;
  title: string;
  status: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [students, setStudents] = useState(0);
  const [staff, setStaff] = useState(0);
  const [admins, setAdmins] = useState(0);

  const [totalComplaints, setTotalComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [resolvedComplaints, setResolvedComplaints] = useState(0);

  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        router.push('/signin');
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists()) {
        router.push('/signin');
        return;
      }

      if (snap.data().role !== 'admin') {
        router.push('/dashboard/student');
        return;
      }

      setLoading(false);

      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const complaintsQuery = query(
        collection(db, 'complaints'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const users: UserData[] = [];

        let studentCount = 0;
        let staffCount = 0;
        let adminCount = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          const role = data.role ?? 'student';

          if (role === 'student') studentCount++;
          else if (role === 'staff') staffCount++;
          else if (role === 'admin') adminCount++;

          users.push({
            id: docSnap.id,
            fullName: data.fullName ?? '',
            email: data.email ?? '',
            department: data.department ?? '',
            role,
          });
        });

        setRecentUsers(users);
        setStudents(studentCount);
        setStaff(staffCount);
        setAdmins(adminCount);
        setTotalUsers(
          studentCount + staffCount + adminCount
        );
      });

      const unsubscribeComplaints = onSnapshot(
        complaintsQuery,
        (snapshot) => {
          const complaints: ComplaintData[] = [];

          let pending = 0;
          let resolved = 0;

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            const status = data.status ?? 'Pending';

            if (status === 'Resolved') {
              resolved++;
            } else {
              pending++;
            }

            complaints.push({
              id: docSnap.id,
              title: data.title ?? '',
              status,
            });
          });

          setRecentComplaints(complaints);
          setTotalComplaints(snapshot.size);
          setPendingComplaints(pending);
          setResolvedComplaints(resolved);
        }
      );

      return () => {
        unsubscribeUsers();
        unsubscribeComplaints();
      };
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-8">
        <h2 className="text-xl font-semibold">
          Loading Admin Dashboard...
        </h2>
      </main>
    );
  }
<div className="flex justify-end mb-4">
  <LogoutButton />
</div>
  return (
    <main className="max-w-7xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-2">
        Admin Dashboard
      </h1>

      <p className="text-gray-600 mb-8">
        Manage users, staff, complaints and system settings.
      </p>      {/* USER STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white border rounded-xl p-6 shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">
            {totalUsers}
          </h2>
        </div>

        <div className="bg-blue-50 border rounded-xl p-6 shadow">
          <p className="text-blue-700">Students</p>
          <h2 className="text-3xl font-bold mt-2">
            {students}
          </h2>
        </div>

        <div className="bg-yellow-50 border rounded-xl p-6 shadow">
          <p className="text-yellow-700">Staff</p>
          <h2 className="text-3xl font-bold mt-2">
            {staff}
          </h2>
        </div>

        <div className="bg-red-50 border rounded-xl p-6 shadow">
          <p className="text-red-700">Admins</p>
          <h2 className="text-3xl font-bold mt-2">
            {admins}
          </h2>
        </div>

      </div>

      {/* COMPLAINT STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white border rounded-xl p-6 shadow">
          <p className="text-gray-500">
            Total Complaints
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalComplaints}
          </h2>
        </div>

        <div className="bg-yellow-50 border rounded-xl p-6 shadow">
          <p className="text-yellow-700">
            Pending
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {pendingComplaints}
          </h2>
        </div>

        <div className="bg-green-50 border rounded-xl p-6 shadow">
          <p className="text-green-700">
            Resolved
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {resolvedComplaints}
          </h2>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="border rounded-xl p-6 shadow mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <Link
            href="/dashboard/admin/users"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Manage Users
          </Link>

          <Link
            href="/dashboard/staff/reports"
            className="bg-green-600 text-white px-5 py-3 rounded-lg"
          >
            Manage Complaints
          </Link>

          <Link
            href="/notifications"
            className="bg-purple-600 text-white px-5 py-3 rounded-lg"
          >
            Notifications
          </Link>

        </div>

      </div>      {/* RECENT USERS */}
      <div className="border rounded-xl p-6 shadow mb-8">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            Recent Users
          </h2>

          <Link
            href="/dashboard/admin/users"
            className="text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <p className="text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="space-y-3">

            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {user.fullName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user.department}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : user.role === 'staff'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* RECENT COMPLAINTS */}
      <div className="border rounded-xl p-6 shadow">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            Recent Complaints
          </h2>

          <Link
            href="/dashboard/staff/reports"
            className="text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <p className="text-gray-500">
            No complaints found.
          </p>
        ) : (
          <div className="space-y-3">

            {recentComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {complaint.title}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    complaint.status === 'Resolved'
                      ? 'bg-green-100 text-green-700'
                      : complaint.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

    </main>
  );
}