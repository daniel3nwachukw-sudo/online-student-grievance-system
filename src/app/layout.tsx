import type { ReactNode } from 'react';
import './globals.css';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

export const metadata = {
  title: 'Online Student Grievance System',
  description: 'Student complaint and grievance management system',
  appleWebApp: {
    capable: true,
    title: 'Grievance',
    statusBarStyle: 'default',
  },
};

export const viewport = {
  themeColor: '#1e3a8a',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}