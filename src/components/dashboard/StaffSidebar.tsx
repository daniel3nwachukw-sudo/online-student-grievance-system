'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  Bell,
  User,
  Settings,
} from 'lucide-react';

export default function StaffSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          EasyGrievance
        </h1>

        <p className="text-sm text-slate-400">
          Staff Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <Link
          href="/dashboard/staff"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/dashboard/staff/reports"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
        >
          <ClipboardList size={20} />
          Complaints
        </Link>

        <Link
          href="/notifications"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
        >
          <Bell size={20} />
          Notifications
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
        >
          <User size={20} />
          Profile
        </Link>
<Link
  href="/dashboard/staff/settings"
  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
>
  <Settings size={20} />
  Settings
</Link>

      </nav>

    </aside>
  );
}