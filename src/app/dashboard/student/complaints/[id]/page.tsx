'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import {
  ArrowLeft,
  ClipboardList,
  CircleCheckBig,
  CircleX,
  Clock3,
  MessageSquareText,
  ShieldAlert,
} from 'lucide-react';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  anonymous?: boolean;
  reporterName?: string;
  reporterDepartment?: string;
  reporterLevel?: string;
  issueSemester?: string;
  issueSession?: string;
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

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) return;

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

      const userData = userSnap.data();
      const role = userData.role;

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

      const complaintRef = doc(db, 'complaints', complaintId);
      const complaintSnap = await getDoc(complaintRef);

      if (!complaintSnap.exists()) {
        setMessage('Complaint not found.');
        setLoading(false);
        return;
      }

      const data = complaintSnap.data();

      if (data.reporterId !== user.uid) {
        setMessage('You do not have permission to view this complaint.');
        setLoading(false);
        return;
      }

      setComplaint({
        id: complaintSnap.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        department: data.department || '',
        status: data.status || 'Pending',
        anonymous: data.anonymous || false,
        reporterName: data.reporterName || '',
        reporterDepartment: data.reporterDepartment || '',
        reporterLevel: data.reporterLevel || '',
        issueSemester: data.issueSemester || '',
        issueSession: data.issueSession || '',
        createdAt: data.createdAt || null,
      });

      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [complaintId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">Loading complaint...</p>
      </main>
    );
  }

  if (message || !complaint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Details</h1>
          <p className="mt-3 text-slate-600">{message || 'Complaint not found.'}</p>

          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Submitted: {formatDateTime(complaint.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <StatusBadge status={complaint.status} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-slate-700">
                  {complaint.description}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Complaint Info
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Category" value={complaint.category || 'General'} />
                  <InfoRow label="Department" value={complaint.department || 'N/A'} />
                  <InfoRow
                    label="Anonymous"
                    value={complaint.anonymous ? 'Yes' : 'No'}
                  />
                  <InfoRow
                    label="Issue Session"
                    value={complaint.issueSession || 'N/A'}
                  />
                  <InfoRow
                    label="Issue Semester"
                    value={complaint.issueSemester || 'N/A'}
                  />
                  <InfoRow
                    label="Status"
                    value={complaint.status || 'Pending'}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <MessageSquareText size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-slate-900">Reporter</h2>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <InfoRow label="Name" value={complaint.anonymous ? 'Anonymous' : complaint.reporterName || 'Student'} />
                  <InfoRow
                    label="Department"
                    value={complaint.reporterDepartment || complaint.department || 'N/A'}
                  />
                  <InfoRow label="Level" value={complaint.reporterLevel || 'N/A'} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900">Progress</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} />
                    <span>Submitted complaint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheckBig size={16} />
                    <span>Waiting for staff response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleX size={16} />
                    <span>Status updates appear here</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}