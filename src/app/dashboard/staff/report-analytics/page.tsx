'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { useComplaints } from '@/src/hooks/useComplaints';
import {
  BarChart3,
  ClipboardList,
  FileBarChart2,
  CircleCheckBig,
  Clock3,
  CircleX,
  Users,
  ArrowLeft,
} from 'lucide-react';

type Complaint = {
  id: string;
  title?: string;
  category?: string;
  status?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
  anonymous?: boolean;
  isAnonymous?: boolean;
};

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return days;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function ReportAnalyticsPage() {
  const { complaints, loading, error } = useComplaints({ mode: 'staff' });
  const typedComplaints = complaints as Complaint[];

  const total = typedComplaints.length;
  const pending = typedComplaints.filter((c) => (c.status || '').toLowerCase() === 'pending').length;
  const resolved = typedComplaints.filter((c) => (c.status || '').toLowerCase() === 'resolved').length;
  const rejected = typedComplaints.filter((c) => (c.status || '').toLowerCase() === 'rejected').length;
  const anonymous = typedComplaints.filter((c) => c.anonymous || c.isAnonymous).length;

  const statusData = useMemo(
    () => [
      { label: 'Pending', value: pending, color: '#f59e0b' },
      { label: 'Resolved', value: resolved, color: '#10b981' },
      { label: 'Rejected', value: rejected, color: '#ef4444' },
    ],
    [pending, resolved, rejected]
  );

  const categoryCounts = useMemo(() => {
    return typedComplaints.reduce<Record<string, number>>((acc, c) => {
      const key = c.category || 'Others';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [typedComplaints]);

  const trendData = useMemo(() => {
    const days = getLast7Days();

    return days.map((day) => {
      const dayKey = day.toDateString();
      const count = typedComplaints.filter((c) => {
        const created = c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000) : null;
        return created ? created.toDateString() === dayKey : false;
      }).length;

      return { label: formatDayLabel(day), value: count };
    });
  }, [typedComplaints]);

  const maxTrend = Math.max(...trendData.map((d) => d.value), 1);

  const trendPoints = trendData
    .map((d, index) => {
      const width = 520;
      const height = 180;
      const leftPad = 20;
      const topPad = 20;
      const x = leftPad + (index * width) / (trendData.length - 1);
      const y = topPad + (1 - d.value / maxTrend) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const categoryItems = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <DashboardLayout title="Report Analytics" sidebar={<StaffSidebar />}>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Staff reports</p>
            <h1 className="text-2xl font-bold text-slate-900">Report Analytics</h1>
          </div>

          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Total', value: total, icon: ClipboardList, color: 'bg-slate-100 text-slate-700' },
            { label: 'Pending', value: pending, icon: Clock3, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Resolved', value: resolved, icon: CircleCheckBig, color: 'bg-green-100 text-green-700' },
            { label: 'Rejected', value: rejected, icon: CircleX, color: 'bg-red-100 text-red-700' },
            { label: 'Anonymous', value: anonymous, icon: Users, color: 'bg-blue-100 text-blue-700' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}>
                  <Icon size={22} />
                </div>
                <p className="text-3xl font-bold text-slate-900">{loading ? '...' : item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">7-Day Trend</h2>
              <span className="text-sm text-emerald-700">Live data</span>
            </div>

            <div className="h-72 rounded-xl bg-slate-50 p-4">
              {trendData.some((d) => d.value > 0) ? (
                <svg viewBox="0 0 560 240" className="h-full w-full">
                  <defs>
                    <linearGradient id="analyticsFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendPoints}
                  />

                  <polygon fill="url(#analyticsFill)" points={`20,220 ${trendPoints} 540,220`} />

                  {trendData.map((d, index) => {
                    const width = 520;
                    const height = 180;
                    const leftPad = 20;
                    const topPad = 20;
                    const x = leftPad + (index * width) / (trendData.length - 1);
                    const y = topPad + (1 - d.value / maxTrend) * height;

                    return (
                      <g key={d.label}>
                        <circle cx={x} cy={y} r="4" fill="#2563eb" />
                        <text x={x} y="235" textAnchor="middle" className="fill-slate-500 text-[11px]">
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No trend data yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Status Breakdown</h2>

            <div className="space-y-4">
              {statusData.map((item) => {
                const percent = total ? (item.value / total) * 100 : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.value} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Category Summary</h3>
              <div className="space-y-2 text-sm">
                {categoryItems.length ? (
                  categoryItems.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-slate-700">{name}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No category data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Analytics Summary</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FileBarChart2 size={16} />
              Complaints report
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Highest status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {statusData.reduce((best, item) => (item.value > best.value ? item : best), statusData[0] || { label: '-', value: 0 }).label}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Most used category</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {categoryItems[0]?.[0] || 'No data'}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Resolved rate</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {total ? Math.round((resolved / total) * 100) : 0}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Pending rate</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {total ? Math.round((pending / total) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}