import type { ReactNode } from 'react';
import './globals.css';
import AuthGate from '@/src/components/AuthGate';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}