import type { ReactNode } from 'react';
import PushNotificationSetup from './PushNotificationSetup';

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
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-50 lg:overflow-hidden">
      <div className="shrink-0">{sidebar}</div>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-20 sm:px-6 sm:pt-20 lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
          {title ? (
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
          ) : <span />}
          <PushNotificationSetup />
        </div>

        {children}
      </main>
    </div>
  );
}