'use client';

import LogoutButton from '@/src/components/LogoutButton';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Bell,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col">

      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold">
          EasyGrievance
        </h1>

        <p className="text-sm text-gray-400">
          Administrator
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">

        <Link
          href="/dashboard/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/dashboard/admin/users"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          <Users size={20} />
          Manage Users
        </Link>

        <Link
          href="/dashboard/admin/complaints"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          <ClipboardList size={20} />
          Complaints
        </Link>

        <Link
          href="/notifications"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          <Bell size={20} />
          Notifications
        </Link>

        <Link
          href="/dashboard/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          <Settings size={20} />
          Settings
        </Link>

      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 pt-4">

        <div className="flex items-center gap-3 text-sm text-gray-300 mb-4">
          <Shield size={18} />
          Administrator
        </div>

        <div className="flex items-center gap-3">
          <LogOut size={18} />
          <LogoutButton />
        </div>

      </div>

    </aside>
  );
}