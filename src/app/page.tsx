'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/signin');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
      <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-sky-400/60 blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/60 blur-3xl animate-pulse" />
      <div className="absolute inset-0 bg-white/10" />

      <section className="relative z-10 w-[92%] max-w-md rounded-[30px] border border-white/25 bg-white/15 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl border border-white/30 bg-white/15 text-[26px] font-extrabold text-white shadow-inner">
          GS
        </div>

        <h1 className="text-[clamp(26px,4vw,32px)] font-extrabold leading-tight tracking-tight text-white">
          Online Student Grievance System
        </h1>

        <p className="mt-3 text-[15px] leading-7 text-white/90">
          Report issues, track complaints, and stay updated in one place.
        </p>

        <div className="mt-7 flex justify-center gap-2" aria-label="Loading">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/95 [animation-delay:-0.2s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/95 [animation-delay:-0.1s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/95" />
        </div>
      </section>
    </main>
  );
}