'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 text-white">
      <div className="text-center animate-fadeIn">
        
        {/* Logo Circle */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-md shadow-lg animate-pulse">
          <span className="text-3xl font-bold">SG</span>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold tracking-wide">
          Student Grievance System
        </h1>

        <p className="mt-2 text-sm text-white/80">
          Loading{dots}
        </p>

        {/* Loading Bar */}
        <div className="mt-6 w-64 mx-auto h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-white animate-pulse rounded-full"></div>
        </div>

      </div>
    </div>
  );
}