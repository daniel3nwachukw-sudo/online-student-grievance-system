'use client';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-700 text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-4xl font-bold">Grievance System</h1>
        <p className="mt-2 text-sm opacity-80">Initializing...</p>
      </div>
    </div>
  );
}