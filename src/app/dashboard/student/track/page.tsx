'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import {
  Search,
  AlertTriangle,
  Clock3,
  CircleCheckBig,
  FileText,
  ArrowRight,
  XCircle,
} from 'lucide-react';

type ComplaintItem = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
};

type Step = 'pending' | 'inprogress' | 'resolved' | 'rejected';

function normalizeStatus(status?: string): Step {
  const value = (status || 'pending').toLowerCase();

  if (value.includes('reject')) return 'rejected';
  if (value.includes('resolve')) return 'resolved';
  if (value.includes('progress') || value.includes('ongoing') || value.includes('working'))
    return 'inprogress';
  return 'pending';
}

function formatDateTime(createdAt?: ComplaintItem['createdAt']) {
  if (!createdAt?.seconds) return 'Just now';

  const date = new Date(createdAt.seconds * 1000);
  return `${date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} · ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function TrackLine({ status }: { status?: string }) {
  const step = normalizeStatus(status);

  const pendingDone = step === 'pending' || step === 'inprogress' || step === 'resolved';
  const inProgressDone = step === 'inprogress' || step === 'resolved';
  const resolvedDone = step === 'resolved';

  if (step === 'rejected') {
    return (
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-red-600">
          <span>Rejected</span>
          <span>Closed</span>
        </div>
        <div className="relative h-2 rounded-full bg-red-500">
          <div className="absolute inset-0 rounded-full bg-red-500" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
          <XCircle size={16} />
          Complaint was rejected.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
        <span className={pendingDone ? 'text-yellow-600' : 'text-slate-400'}>Pending</span>
        <span className={inProgressDone ? 'text-orange-600' : 'text-slate-400'}>In Progress</span>
        <span className={resolvedDone ? 'text-green-600' : 'text-slate-400'}>Resolved</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StepBlock
          label="Pending"
          active={pendingDone}
          color="bg-yellow-400"
          text="text-yellow-700"
        />
        <StepBlock
          label="In Progress"
          active={inProgressDone}
          color="bg-orange-500"
          text="text-orange-700"
        />
        <StepBlock
          label="Resolved"
          active={resolvedDone}
          color="bg-green-500"
          text="text-green-700"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
        {step === 'pending' && (
          <>
            <Clock3 size={16} className="text-yellow-500" />
            <span>Waiting for staff to review.</span>
          </>
        )}
        {step === 'inprogress' && (
          <>
            <AlertTriangle size={16} className="text-orange-500" />
            <span>Staff is working on it.</span>
          </>
        )}
        {step === 'resolved' && (
          <>
            <CircleCheckBig size={16} className="text-green-500" />
            <span>Complaint has been resolved.</span>
          </>
        )}
      </div>
    </div>
  );
}

function StepBlock({
  label,
  active,
  color,
  text,
}: {
  label: string;
  active: boolean;
  color: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          active ? `${color} border-transparent` : 'border-slate-300 bg-white'
        }`}
      />
      <div className="h-1 w-full rounded-full bg-slate-200">
        <div
          className={`h-1 rounded-full transition-all ${
            active ? color : 'bg-slate-200'
          }`}
        />
      </div>
      <span className={`text-xs font-semibold ${active ? text : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default function TrackComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);

  useEffect(() => {
    let unsubscribeComplaints: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/signin');
        return;
      }

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (!userSnap.exists()) {
        router.replace('/signin');
        return;
      }

      const userData = userSnap.data();
      if (userData.role === 'staff') {
        router.replace('/dashboard/staff');
        return;
      }

      if (userData.role === 'admin') {
        router.replace('/dashboard/admin');
        return;
      }

      const q = query(
        collection(db, 'complaints'),
        where('studentId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribeComplaints = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || data.complaintTitle || '',
            description: data.description || '',
            category: data.category || '',
            status: data.status || 'Pending',
            createdAt: data.createdAt || null,
          };
        });

        setComplaints(items);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeComplaints) unsubscribeComplaints();
    };
  }, [router]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => normalizeStatus(c.status) === 'pending').length,
      progress: complaints.filter((c) => normalizeStatus(c.status) === 'inprogress').length,
      resolved: complaints.filter((c) => normalizeStatus(c.status) === 'resolved').length,
      rejected: complaints.filter((c) => normalizeStatus(c.status) === 'rejected').length,
    };
  }, [complaints]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Loading complaint tracker...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Track Complaints</h1>
              <p className="mt-1 text-slate-600">
                Follow the progress of every complaint you submitted.
              </p>
            </div>

            <Link
              href="/dashboard/student/complaints"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <FileText size={16} />
              My Complaints
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard icon={FileText} label="Total" value={stats.total} />
          <StatCard icon={Clock3} label="Pending" value={stats.pending} />
          <StatCard icon={AlertTriangle} label="In Progress" value={stats.progress} />
          <StatCard icon={CircleCheckBig} label="Resolved" value={stats.resolved} />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Complaint Tracker</h2>
          </div>

          {complaints.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={24} />
              </div>
              <p className="text-lg font-medium text-slate-700">No complaints found.</p>
              <p className="mt-1 text-sm">
                Submit a complaint first, then track its progress here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {complaints.map((item) => {
                const step = normalizeStatus(item.status);
                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {item.title || 'Untitled Complaint'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.category ? `Category: ${item.category}` : 'No category'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Submitted: {formatDateTime(item.createdAt)}
                        </p>
                      </div>

                      <StatusTag status={step} />
                    </div>

                    {item.description ? (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    ) : null}

                    <TrackLine status={item.status} />

                    <div className="mt-5 flex items-center justify-end">
                      <Link
                        href={`/dashboard/student/complaints/${item.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        View details <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatusTag({ status }: { status: Step }) {
  if (status === 'pending') {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Pending
      </span>
    );
  }

  if (status === 'inprogress') {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
        In Progress
      </span>
    );
  }

  if (status === 'resolved') {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Resolved
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
      Rejected
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}