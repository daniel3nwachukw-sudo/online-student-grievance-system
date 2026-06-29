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
  { label: 'My Complaints', href: '/complaint', icon: FileText },
  { label: 'Submit Complaint', href: '/submit', icon: PenTool },
  { label: 'Anonymous Complaint', href: '/dashboard/student/anonymous', icon: ShieldCheck },
  { label: 'Track Complaint', href: '/complaint', icon: ScanSearch },
  { label: 'Responses', href: '/responses', icon: MessageSquareText },
  { label: 'My Profile', href: '/profile', icon: UserRound },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [userName, setUserName] = useState('Student');
  const [userMeta, setUserMeta] = useState('Student');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) return;

      const data = snap.data() as UserInfo;
      setUserName(data.fullName || user.displayName || 'Student');
      setUserMeta(
        [data.department, data.level, data.matricNo].filter(Boolean).join(' • ') || 'Student'
      );
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut(auth);
    router.replace('/signin');
  }

  return (
    <aside
      className={`flex h-screen w-72 shrink-0 flex-col bg-[#07162f] text-white shadow-xl transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <span className="text-lg font-bold">EG</span>
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">Grievance</h2>
            <p className="text-sm text-white/70">System</p>
          </div>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-white/10 p-2 text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-[#4f6ef7] text-white shadow-lg shadow-blue-500/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-3xl bg-[#17306a] p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <UserRound size={24} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-white/70">{userMeta}</p>
            </div>
          </div>

          <div className="mt-4 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
            Student
          </div>
        </div>
      </div>
    </aside>
  );
}