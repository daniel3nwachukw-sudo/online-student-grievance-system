'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';

import {
  ArrowRight,
  MessageSquareText,
  ShieldCheck,
  Clock3,
  CircleCheckBig,
  Search,
  FileText,
} from 'lucide-react';

type ResponseItem = {
  id: string;
  complaintId?: string;
  complaintTitle?: string;
  response?: string;
  status?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
};

function StatusBadge({ status }: { status?: string }) {
  const value = (status || 'New').toLowerCase();

  if (value === 'read') {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        Read
      </span>
    );
  }

  if (value === 'resolved') {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Resolved
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      New
    </span>
  );
}

function formatDateTime(createdAt?: ResponseItem['createdAt']) {
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

export default function StudentResponsesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseItem[]>([]);

  useEffect(() => {
    let unsubscribeResponses: (() => void) | undefined;

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
        collection(db, 'responses'),
        where('studentId', '==', user.uid)
      );

      unsubscribeResponses = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            complaintId: data.complaintId || '',
            complaintTitle: data.complaintTitle || '',
            response: data.response || '',
            status: data.status || 'New',
            createdAt: data.createdAt || null,
          };
        });

        setResponses(
          items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        );
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeResponses) unsubscribeResponses();
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Loading responses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Responses</h1>
              <p className="mt-1 text-slate-600">
                View staff replies and updates on your complaints.
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

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={MessageSquareText} label="Total Responses" value={responses.length} />
          <StatCard
            icon={Clock3}
            label="New"
            value={responses.filter((r) => (r.status || 'New').toLowerCase() === 'new').length}
          />
          <StatCard
            icon={CircleCheckBig}
            label="Read"
            value={responses.filter((r) => (r.status || '').toLowerCase() === 'read').length}
          />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Response List</h2>
          </div>

          {responses.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={24} />
              </div>
              <p className="text-lg font-medium text-slate-700">No responses yet.</p>
              <p className="mt-1 text-sm">
                Staff replies will appear here after your complaint is reviewed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {responses.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <ShieldCheck size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900">
                      {item.complaintTitle || 'Complaint Response'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.response || 'No response text available.'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Received: {formatDateTime(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />

                    {item.complaintId ? (
                      <Link
                        href={`/dashboard/student/complaints/${item.complaintId}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}