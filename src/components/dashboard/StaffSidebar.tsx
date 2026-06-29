'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  ClipboardList,
  Clock3,
  CircleCheckBig,
  CircleX,
  Reply,
  BarChart3,
  Building2,
  LogOut,
  Bell,
  Menu,
  X,
  UserCircle2,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { auth } from '@/src/lib/firebase';

const navItems = [
  { label: 'Dashboard', href: '/dashboard/staff', icon: LayoutDashboard },
  { label: 'All Complaints', href: '/dashboard/staff', icon: ClipboardList },
  { label: 'Pending Complaints', href: '/dashboard/staff/pending', icon: Clock3 },
  { label: 'Resolved Complaints', href: '/dashboard/staff/resolved', icon: CircleCheckBig },
  { label: 'Rejected Complaints', href: '/dashboard/staff/reject', icon: CircleX },
  { label: 'Respond to Complaints', href: '/dashboard/staff/respond', icon: Reply },
  { label: 'Reports & Analytics', href: '/dashboard/staff/report-analytics', icon: BarChart3 },
  { label: 'Departments', href: '/dashboard/staff/departments', icon: Building2 },
  { label: 'Manage Users', href: '/dashboard/staff/users', icon: Users },
  { label: 'Profile', href: '/dashboard/staff/profile', icon: User },
  { label: 'Settings', href: '/dashboard/staff/settings', icon: Settings },
];

export default function StaffSidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const closeSidebar = () => setOpen(false);

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) closeSidebar();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg transition hover:bg-emerald-800 lg:hidden"
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-hidden bg-gradient-to-b from-emerald-950 to-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="shrink-0 border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Bell size={20} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Grievance</h1>
              <p className="text-sm text-white/70">System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/dashboard/staff'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition ${
                  active ? 'bg-emerald-700 text-white' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white/85 transition hover:bg-white/10"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>

        <div className="shrink-0 p-4">
          <div className="rounded-2xl border border-white/10 bg-emerald-950/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/10">
                <UserCircle2 size={42} className="text-white/90" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">Staff User</p>
                <p className="truncate text-sm text-white/70">Administrator</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center rounded-full bg-emerald-600/30 px-3 py-1 text-xs font-semibold text-emerald-200">
                Staff
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}