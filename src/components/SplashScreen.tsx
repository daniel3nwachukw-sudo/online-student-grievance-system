'use client';

import { useEffect, useState } from 'react';

type SplashScreenProps = {
  show?: boolean;
};

export default function SplashScreen({ show = true }: SplashScreenProps) {
  const [visible, setVisible] = useState(show);
  const [mounted, setMounted] = useState(show);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (show) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), 350);
    return () => clearTimeout(timeout);
  }, [show]);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-[#0b2f2a] to-slate-950 text-white transition-opacity duration-300 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.10),transparent_35%)]" />

      <div
        className={`relative text-center transition-all duration-300 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/8 shadow-2xl backdrop-blur-md animate-pulse">
          <span className="text-3xl font-bold tracking-wide">SG</span>
        </div>

        <h1 className="text-3xl font-bold tracking-wide text-white sm:text-4xl">
          Student Grievance System
        </h1>

        <p className="mt-3 text-sm text-white/75">Loading{dots}</p>

        <div className="mt-6 mx-auto h-1 w-64 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}