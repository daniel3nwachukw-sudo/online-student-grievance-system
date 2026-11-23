import type { ReactNode } from 'react';
import './globals.css';
import RegisterSW from '../components/RegisterSW';

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
        <RegisterSW />
      </body>
    </html>
  );
}