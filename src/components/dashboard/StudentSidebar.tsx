'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  LayoutDashboard,
  FileText,
  PenTool,
  ScanSearch,
  MessageSquareText,
  UserRound,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';

type UserInfo = {
  fullName?: string;
  role?: string;
  department?: string;
  level?: string;
  matricNo?: string;
};

const navItems = [
  { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { label: 'My Complaints', href: '/dashboard/student/complaints', icon: FileText },
  { label: 'Submit Complaint', href: '/dashboard/student/new', icon: PenTool },
  { label: 'Anonymous Complaint', href: '/dashboard/student/anonymous', icon: ShieldCheck },
  { label: 'Track Complaint', href: '/dashboard/student/track', icon: ScanSearch },
  { label: 'Responses', href: '/dashboard/student/responses', icon: MessageSquareText },
  { label: 'My Profile', href: '/dashboard/student/profile', icon: UserRound },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('Student');
  const [userMeta, setUserMeta] = useState('Student');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) return;

      const data = snap.data() as UserInfo;
      setUserName(data.fullName || user.displayName || 'Student');
      setUserMeta([data.department, data.level, data.matricNo].filter(Boolean).join(' • ') || 'Student');
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut(auth);
    router.replace('/signin');
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-full bg-[#07162f] p-3 text-white shadow-lg lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-[#07162f] text-white shadow-xl transition-all duration-300 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
        } lg:translate-x-0 ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <span className="text-lg font-bold">EG</span>
            </div>

            {!collapsed && (
              <div>
                <h2 className="text-xl font-bold leading-tight">Grievance</h2>
                <p className="text-sm text-white/70">System</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden rounded-full bg-white/10 p-2 text-white lg:inline-flex"
              aria-label="Collapse sidebar"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-white/10 p-2 text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-[#4f6ef7] text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'lg:justify-center lg:px-3' : ''}`}
                >
                  <Icon size={18} />
                  <span className={`${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className={`mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${
                collapsed ? 'lg:justify-center lg:px-3' : ''
              }`}
            >
              <LogOut size={18} />
              <span className={`${collapsed ? 'lg:hidden' : ''}`}>Logout</span>
            </button>
          </div>
        </nav>

        <div className="px-3 pb-5">
          <div className="rounded-3xl bg-[#17306a] p-4 shadow-lg">
            <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                <UserRound size={24} />
              </div>

              <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="truncate text-sm font-semibold">{userName}</p>
                <p className="truncate text-xs text-white/70">{userMeta}</p>
              </div>
            </div>

            <div className={`mt-4 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white ${
              collapsed ? 'lg:hidden' : ''
            }`}>
              Student
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}