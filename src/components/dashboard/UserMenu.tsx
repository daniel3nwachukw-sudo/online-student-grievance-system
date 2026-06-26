'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const closeMenu = () => setOpen(false);

    window.addEventListener('click', closeMenu);

    return () =>
      window.removeEventListener('click', closeMenu);
  }, []);

  const logout = async () => {
    await signOut(auth);
    window.location.href = '/signin';
  };

  return (
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* USER BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 transition"
      >
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          {user?.displayName?.charAt(0).toUpperCase() ??
            user?.email?.charAt(0).toUpperCase() ??
            'U'}
        </div>

        <div className="hidden md:block text-left">
          <p className="font-semibold text-sm">
            {user?.displayName ?? 'User'}
          </p>

          <p className="text-xs text-slate-500">
            {user?.email}
          </p>
        </div>

        <ChevronDown size={18} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-xl border bg-white shadow-2xl z-50 overflow-hidden">

          <div className="px-5 py-4 border-b">
            <p className="font-bold">
              {user?.displayName ?? 'User'}
            </p>

            <p className="text-sm text-slate-500">
              {user?.email}
            </p>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-100"
          >
            <User size={18} />
            My Profile
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-100"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      )}
    </div>
  );
}