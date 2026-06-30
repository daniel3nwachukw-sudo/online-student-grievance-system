'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, Unsubscribe } from 'firebase/firestore';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StudentSidebar from '@/src/components/dashboard/StudentSidebar';
import { auth, db } from '@/src/lib/firebase';
import { useComplaints } from '@/src/hooks/useComplaints';
import {
  Bell,
  UserCircle2,
  FileText,
  Clock3,
  CircleCheckBig,
  CircleX,
  ArrowRight,
  Search,
  BadgeInfo,
  MessageSquareText,
  ClipboardList,
  PenTool,
  ChevronRight,
} from 'lucide-react';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  anonymous?: boolean;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
};

function StatusBadge({ status }: { status?: string }) {
  const value = (status || 'Pending').toLowerCase();

  if (value === 'resolved') return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Resolved</span>;
  if (value === 'rejected') return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Rejected</span>;
  if (value === 'in progress') return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">In Progress</span>;
  return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>;
}

function formatDateTime(createdAt?: Complaint['createdAt']) {
  if (!createdAt?.seconds) return 'Just now';
  const date = new Date(createdAt.seconds * 1000);
  return (
    date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [pending, setPending] = useState(0);
  const [rejected, setRejected] = useState(0);

  useEffect(() => {
    let unsubscribeComplaints: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace('/signin');
          return;
        }

        const userSnap = await getDoc(doc(db, 'users', user.uid));

        if (!userSnap.exists()) {
          setError('Student profile not found.');
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

        const q = query(collection(db, 'complaints'), where('reporterId', '==', user.uid));

        unsubscribeComplaints = onSnapshot(
          q,
          (snapshot) => {
            const list: Complaint[] = [];
            let resolvedCount = 0;
            let pendingCount = 0;
            let rejectedCount = 0;

            snapshot.forEach((d) => {
              const complaint = d.data();
              const status = complaint.status || 'Pending';

              list.push({
                id: d.id,
                title: complaint.title || '',
                description: complaint.description || '',
                category: complaint.category || '',
                department: complaint.department || '',
                status,
                anonymous: complaint.anonymous || false,
                createdAt: complaint.createdAt || null,
              });

              const normalized = status.toLowerCase();
              if (normalized === 'resolved') resolvedCount++;
              else if (normalized === 'rejected') rejectedCount++;
              else pendingCount++;
            });

            setComplaints(list);
            setTotal(snapshot.size);
            setResolved(resolvedCount);
            setPending(pendingCount);
            setRejected(rejectedCount);
            setDataLoading(false);
          },
          (err) => {
            setError(err.message || 'Failed to load complaints.');
            setDataLoading(false);
          }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard.';
        setError(message);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeComplaints) unsubscribeComplaints();
    };
  }, [router]);

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 3);
  }, [complaints]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Checking account...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">Dashboard error</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button onClick={() => router.refresh()} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard" sidebar={<StudentSidebar />}>
      {dataLoading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 text-slate-600 shadow-sm">
          Loading your complaints...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Dashboard</p>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100">
                <Bell size={20} />
                <span className="absolute right-0 top-0 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">3</span>
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <UserCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg text-white/90">Welcome back,</p>
                <h2 className="mt-1 text-3xl font-bold">{studentName}</h2>
                <p className="mt-3 text-white/90">We are here to listen and help.</p>
              </div>

              <div className="hidden lg:block">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <MessageSquareText size={30} />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Support Team</p>
                    <p className="font-semibold">Always ready for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-slate-900">Overview</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Total Complaints', value: total, icon: FileText, bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', link: '/complaint' },
                { label: 'Pending', value: pending, icon: Clock3, bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', link: '/complaint' },
                { label: 'Resolved', value: resolved, icon: CircleCheckBig, bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', link: '/complaint' },
                { label: 'Rejected', value: rejected, icon: CircleX, bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', link: '/complaint' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`rounded-2xl border border-slate-100 p-5 shadow-sm ${item.bg}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                      <Icon className={item.iconColor} size={22} />
                    </div>
                    <div className="mt-5">
                      <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                    </div>
                    <Link href={item.link} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
                      View all
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Complaints</h3>
              <Link href="/complaint" className="text-sm font-medium text-blue-700 hover:underline">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentComplaints.length === 0 ? (
                <div className="p-5 text-slate-500">No complaints submitted yet.</div>
              ) : (
                recentComplaints.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <ClipboardList size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-slate-900">{c.title}</h4>
                      <p className="mt-1 truncate text-sm text-slate-500">{c.category || 'General'}</p>
                      <p className="mt-1 text-sm text-slate-500">Submitted: {formatDateTime(c.createdAt)}</p>
                    </div>
                    <StatusBadge status={c.status} />
                    <Link href={`/complaint/${c.id}`} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link href="/dashboard/student/new" className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <PenTool size={24} />
                </div>
                <p className="mt-4 font-semibold text-slate-900">Submit Complaint</p>
              </Link>

              <Link href="/dashboard/student/new?anonymous=1" className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <UserCircle2 size={24} />
                </div>
                <p className="mt-4 font-semibold text-slate-900">Anonymous Complaint</p>
              </Link>

              <Link href="/complaint" className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <Search size={24} />
                </div>
                <p className="mt-4 font-semibold text-slate-900">Track Complaint</p>
              </Link>

              <Link href="/responses" className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <BadgeInfo size={24} />
                </div>
                <p className="mt-4 font-semibold text-slate-900">View Responses</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}