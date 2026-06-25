'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  role?: string;
  user?: any;
  onLogout?: () => void;
}

export function Navbar({
  role,
  user,
  onLogout,
}: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white">
      <Link
        href="/"
        className="font-bold text-lg"
      >
        Grievance Portal
      </Link>

      <nav className="flex items-center gap-6">
        {!user && (
          <>
            <Link href="/">Home</Link>
            <Link href="/signin">Sign In</Link>
          </>
        )}

        {role === 'student' && (
          <>
            <Link href="/dashboard/student">
              Dashboard
            </Link>

            <Link href="/dashboard/student/new">
              New Complaint
            </Link>

            <Link href="/complaint">
              Track Complaint
            </Link>
          </>
        )}

        {role === 'staff' && (
          <>
            <Link href="/dashboard/admin">
              Dashboard
            </Link>

            <Link href="/dashboard/admin/reports">
              Reports
            </Link>
          </>
        )}
      </nav>

      <div className="relative">
        {user && (
          <button
            onClick={() => setOpen(!open)}
            className="border px-3 py-1 rounded"
          >
            {user.email}
          </button>
        )}

        {open && (
          <button
            onClick={onLogout}
            className="absolute right-0 mt-2 bg-red-600 text-white px-3 py-2 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}