import Link from 'next/link';

const navItems = [
  { href: '/dashboard/student', label: 'Dashboard' },
  { href: '/dashboard/student/new', label: 'New Complaint' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:block">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[.3em] text-brand-700">Navigation</p>
      </div>
      <nav className="space-y-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
