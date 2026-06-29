'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import {
  ArrowLeft,
  Search,
  FileText,
  Tag,
  Building2,
  BadgeInfo,
  ArrowRight,
} from 'lucide-react';

type Complaint = {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  status?: string;
  response?: string;
};

function StatusBadge({ status }: { status?: string }) {
  const value = (status || 'Pending').toLowerCase();

  if (value === 'resolved') {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Resolved
      </span>
    );
  }

  if (value === 'rejected') {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }

  if (value === 'in progress') {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      Pending
    </span>
  );
}

export default function StaffComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Complaint[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title ?? '',
            description: data.description ?? '',
            category: data.category ?? '',
            department: data.department ?? '',
            status: data.status ?? 'Pending',
            response: data.response ?? '',
          });
        });
        setComplaints(list);
        setLoading(false);
      },
      () => {
        setComplaints([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return complaints;

    return complaints.filter((c) => {
      const haystack = [
        c.title,
        c.description,
        c.category,
        c.department,
        c.status,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [complaints, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">All Complaints</h1>
          <p className="mt-2 text-slate-500">Search and open any complaint to respond.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, department, status..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-6 text-slate-500">No complaints match your search.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredComplaints.map((c) => (
              <div key={c.id} className="p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <FileText size={18} />
                      </div>

                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
                        <p className="mt-1 text-slate-700">{c.description}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <Tag size={16} className="text-emerald-700" />
                        <span>Category: {c.category || '-'}</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <Building2 size={16} className="text-emerald-700" />
                        <span>Department: {c.department || '-'}</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <BadgeInfo size={16} className="text-emerald-700" />
                        <span>Status:</span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/dashboard/staff/respond/${c.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Respond
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}