'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-4">Grievance Portal</h1>
        <p className="text-lg text-brand-100 mb-8">Online Student Grievance Logging and Response System</p>
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="mt-8">
          <Link href="/signin" className="text-sm text-brand-200 hover:text-white underline">Skip intro</Link>
        </div>
      </div>
    </div>
  );
}