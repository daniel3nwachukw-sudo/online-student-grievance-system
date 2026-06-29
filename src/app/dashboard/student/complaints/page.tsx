'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  CircleCheckBig,
  CircleX,
  Search,
  FileText,
} from 'lucide-react';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  status?: string;
  anonymous?: boolean;
  createdAt?:
    | {
        seconds?: number;
        nanoseconds?: number;
      }
    | null;
};

function StatusBadge({ status }: { status?: string }) {
  const value = (status || 'Pending').toLowerCase();

  if (value === 'resolved') {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Resolved
      </span>
    );
  }

  if (value === 'rejected') {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }

  if (value === 'in progress') {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        In Progress
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      Pending
    </span>
  );
}

function formatDateTime(createdAt?: Complaint['createdAt']) {
  if (!createdAt?.seconds) return 'Just now';

  const date = new Date(createdAt.seconds * 1000);

  return (
    date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) +
    ' · ' +
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

export default function ComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

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

      const q = query(
        collection(db, 'complaints'),
        where('reporterId', '==', user.uid)
      );

      unsubscribeComplaints = onSnapshot(q, (snapshot) => {
        const list: Complaint[] = snapshot.docs.map((d) => {
          const complaint = d.data();
          return {
            id: d.id,
            title: complaint.title || '',
            description: complaint.description || '',
            category: complaint.category || '',
            status: complaint.status || 'Pending',
            anonymous: complaint.anonymous || false,
            createdAt: complaint.createdAt || null,
          };
        });

        setComplaints(
          list.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          })
        );

        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeComplaints) unsubscribeComplaints();
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Loading complaints...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
              <p className="mt-1 text-slate-600">
                Track all your submitted complaints and their status.
              </p>
            </div>

            <Link
              href="/dashboard/student/new"
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
            >
              <FileText size={16} />
              Submit Complaint
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{complaints.length}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Clock3 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {complaints.filter((c) => (c.status || 'Pending').toLowerCase() === 'pending').length}
                </p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <CircleCheckBig size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {complaints.filter((c) => (c.status || '').toLowerCase() === 'resolved').length}
                </p>
                <p className="text-sm text-slate-500">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Complaint List</h2>
          </div>

          {complaints.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={24} />
              </div>
              <p className="text-lg font-medium text-slate-700">No complaints found.</p>
              <p className="mt-1 text-sm">Submit your first complaint to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <ClipboardList size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900">{c.title}</h3>
                      {c.anonymous ? (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                          Anonymous
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {c.category || 'General'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Submitted: {formatDateTime(c.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={c.status} />

                  <Link
                    href={`/complaint/${c.id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}