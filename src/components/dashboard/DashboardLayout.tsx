'use client';

import Topbar from './Topbar';

type DashboardLayoutProps = {
  title: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function DashboardLayout({
  title,
  sidebar,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      {sidebar}

      {/* Main Section */}
      <div className="flex flex-1 flex-col">

        {/* Top Navigation */}
        <Topbar title={title} />

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}