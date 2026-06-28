'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Complaints',
    href: '/dashboard/student',
    icon: FileText,
  },
  {
    title: 'Submit Complaint',
    href: '/complaint/new',
    icon: PlusCircle,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'My Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-72 flex-col bg-slate-900 text-white shadow-xl">
      <div className="border-b border-slate-700 px-6 py-8">
        <h1 className="text-2xl font-bold">EasyGrievance</h1>
        <p className="mt-1 text-sm text-slate-400">Student Portal</p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold">
            U
          </div>

          <div>
            <p className="font-semibold">User</p>
            <p className="text-xs text-slate-400">Logged In</p>
          </div>
        </div>

        <button className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-4 py-3 transition hover:bg-red-700">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}