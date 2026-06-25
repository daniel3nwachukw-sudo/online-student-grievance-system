import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'Online Student Grievance Logging and Response System',
  description: 'Student grievance portal with Firebase authentication and admin moderation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}