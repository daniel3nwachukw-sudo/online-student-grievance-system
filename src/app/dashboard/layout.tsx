import type { ReactNode } from 'react';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar />
      <main className="min-h-screen p-6 lg:pl-80">{children}</main>
    </div>
  );
}