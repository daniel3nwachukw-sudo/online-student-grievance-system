'use client';

import Link from 'next/link';

export default function StudentSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">
        EasyGrievance
      </h2>

      <nav className="space-y-4">
        <Link href="/dashboard/student" className="block hover:text-blue-400">
          Dashboard
        </Link>

        <Link href="/complaint" className="block hover:text-blue-400">
          My Complaints
        </Link>

        <Link href="/dashboard/student/new" className="block hover:text-blue-400">
          Submit Complaint
        </Link>

        <Link href="/notifications" className="block hover:text-blue-400">
          Notifications
        </Link>

        <Link href="/profile" className="block hover:text-blue-400">
          My Profile
        </Link>

        <Link href="/settings" className="block hover:text-blue-400">
          Settings
        </Link>
      </nav>
    </aside>
  );
}