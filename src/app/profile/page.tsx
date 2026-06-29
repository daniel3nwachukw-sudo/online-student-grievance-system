'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import { useComplaints } from '@/src/hooks/useComplaints';
import {
  FileText,
  Clock3,
  CircleCheckBig,
  CircleX,
  FileBarChart2,
  FileCheck2,
  Users,
  ClipboardList,
} from 'lucide-react';

const quickActions = [
  { label: 'View All Complaints', icon: ClipboardList },
  { label: 'Respond to Complaints', icon: FileCheck2 },
  { label: 'Generate Report', icon: FileBarChart2 },
  { label: 'Manage Users', icon: Users },
];

function StatusBadge({ status }: { status?: string }) {
  const value = (status || '').toLowerCase();

  if (value === 'resolved') {
    return <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Resolved</span>;
  }

  if (value === 'rejected') {
    return <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Rejected</span>;
  }

  return <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Pending</span>;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return days;
}

export default function StaffDashboardPage() {
  const { complaints, loading, error } = useComplaints();

  const total = complaints.length;
  const pending = complaints.filter((c) => (c.status || '').toLowerCase() === 'pending').length;
  const resolved = complaints.filter((c) => (c.status || '').toLowerCase() === 'resolved').length;
  const rejected = complaints.filter((c) => (c.status || '').toLowerCase() === 'rejected').length;

  const recentComplaints = [...complaints].slice(0, 5).map((c, index) => ({
    id: c.id || `#${index + 1}`,
    complainant: c.complainant || 'Anonymous',
    category: c.category || '-',
    subject: c.subject || '-',
    status: c.status || 'Pending',
    date: c.date || '-',
  }));

  const categories = complaints.reduce<Record<string, number>>((acc, c) => {
    const key = c.category || 'Others';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categories).slice(0, 4);

  const trendData = useMemo(() => {
    const days = getLast7Days();

    return days.map((day) => {
      const key = day.toDateString();

      const count = complaints.filter((c) => {
        const created = c.createdAt?.seconds
          ? new Date(c.createdAt.seconds * 1000)
          : c.date
            ? new Date(c.date)
            : null;

        if (!created) return false;
        return created.toDateString() === key;
      }).length;

      return {
        label: formatDayLabel(day),
        value: count,
      };
    });
  }, [complaints]);

  const trendPoints = useMemo(() => {
    const max = Math.max(...trendData.map((d) => d.value), 1);
    const width = 520;
    const height = 180;
    const leftPad = 20;
    const topPad = 20;

    return trendData
      .map((d, index) => {
        const x = leftPad + (index * width) / (trendData.length - 1);
        const y = topPad + (1 - d.value / max) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [trendData]);

  return (
    <DashboardLayout title="Staff Dashboard" sidebar={<StaffSidebar />}>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Complaints',
              value: total,
              icon: FileText,
              bg: 'bg-emerald-50',
              iconBg: 'bg-emerald-100',
              iconColor: 'text-emerald-600',
            },
            {
              label: 'Pending',
              value: pending,
              icon: Clock3,
              bg: 'bg-yellow-50',
              iconBg: 'bg-yellow-100',
              iconColor: 'text-yellow-600',
            },
            {
              label: 'Resolved',
              value: resolved,
              icon: CircleCheckBig,
              bg: 'bg-emerald-50',
              iconBg: 'bg-emerald-100',
              iconColor: 'text-emerald-600',
            },
            {
              label: 'Rejected',
              value: rejected,
              icon: CircleX,
              bg: 'bg-red-50',
              iconBg: 'bg-red-100',
              iconColor: 'text-red-600',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ${item.bg}`}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                  <Icon className={item.iconColor} size={22} />
                </div>
                <p className="text-3xl font-bold text-slate-900">{loading ? '...' : item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Overview</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Complaints analytics</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-emerald-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">Complaints trend</p>
                <p className="text-sm font-semibold text-emerald-700">Live data</p>
              </div>

              <div className="h-64 rounded-2xl bg-white p-4">
                {trendData.some((d) => d.value > 0) ? (
                  <svg viewBox="0 0 560 240" className="h-full w-full">
                    <defs>
                      <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={trendPoints}
                    />

                    <polygon
                      fill="url(#trendFill)"
                      points={`20,220 ${trendPoints} 540,220`}
                    />

                    {trendData.map((d, index) => {
                      const max = Math.max(...trendData.map((x) => x.value), 1);
                      const width = 520;
                      const height = 180;
                      const leftPad = 20;
                      const topPad = 20;
                      const x = leftPad + (index * width) / (trendData.length - 1);
                      const y = topPad + (1 - d.value / max) * height;

                      return (
                        <g key={d.label}>
                          <circle cx={x} cy={y} r="4" fill="#059669" />
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

            <div className="rounded-3xl bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">By category</h3>
              <div className="flex items-center justify-center">
                <div className="relative h-48 w-48 rounded-full border-[18px] border-emerald-400 border-r-blue-400 border-b-yellow-400 border-l-purple-400 border-t-transparent rotate-45" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {categoryEntries.length ? (
                  categoryEntries.map(([name, count]) => (
                    <div key={name} className="flex items-center gap-2 text-slate-700">
                      <span className="h-3 w-3 rounded bg-emerald-400" />
                      {name} ({count})
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No category data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Activity</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Recent complaints</h2>
            </div>
            <button className="text-sm font-semibold text-emerald-700 hover:underline">
              View all
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 font-medium">ID</th>
                  <th className="py-3 pr-4 font-medium">Complainant</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Subject</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{row.id}</td>
                    <td className="py-4 pr-4 text-slate-700">{row.complainant}</td>
                    <td className="py-4 pr-4 text-slate-700">{row.category}</td>
                    <td className="py-4 pr-4 text-slate-700">{row.subject}</td>
                    <td className="py-4 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-4 pr-4 text-slate-700">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && recentComplaints.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">No complaints found.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Quick actions</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Shortcuts</h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon size={22} />
                  </div>
                  <p className="font-semibold text-slate-900">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}