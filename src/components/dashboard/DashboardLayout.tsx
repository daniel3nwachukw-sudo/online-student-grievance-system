import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  title?: string;
  sidebar: ReactNode;
  children: ReactNode;
};

export default function DashboardLayout({
  title,
  sidebar,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 overflow-hidden">
      <div className="shrink-0">{sidebar}</div>

      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        {title ? (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}