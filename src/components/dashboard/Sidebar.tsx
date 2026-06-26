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
    <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl">

      {/* LOGO */}
      <div className="px-6 py-8 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          EasyGrievance
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Student Portal
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER CARD */}
      <div className="border-t border-slate-700 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
            U
          </div>

          <div>
            <p className="font-semibold">
              User
            </p>

            <p className="text-xs text-slate-400">
              Logged In
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 w-full rounded-lg bg-red-600 px-4 py-3 hover:bg-red-700 transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </aside>
  );
}