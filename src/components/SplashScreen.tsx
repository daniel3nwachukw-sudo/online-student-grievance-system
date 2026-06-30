'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/signin');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash-bg">
      <div className="splash-blob splash-blob-one" />
      <div className="splash-blob splash-blob-two" />
      <div className="splash-blob splash-blob-three" />

      <section className="splash-glass">
        <div className="splash-logo-wrap">
          <div className="splash-logo">GS</div>
        </div>

        <h1 className="splash-title">Online Student Grievance System</h1>

        <p className="splash-text">
          Report issues, track complaints, and stay updated in one place.
        </p>

        <div className="splash-loader" aria-label="Loading">
          <span />
          <span />
          <span />
        </div>
      </section>

      <style jsx>{`
        .splash-bg {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
        }

        .splash-blob {
          position: absolute;
          border-radius: 999px;
          filter: blur(80px);
          opacity: 0.55;
          pointer-events: none;
          animation: float 12s ease-in-out infinite;
        }

        .splash-blob-one {
          width: 360px;
          height: 360px;
          top: -80px;
          left: -90px;
          background: rgba(14, 165, 233, 0.65);
        }

        .splash-blob-two {
          width: 400px;
          height: 400px;
          bottom: -120px;
          right: -110px;
          background: rgba(16, 185, 129, 0.65);
          animation-delay: 2s;
        }

        .splash-blob-three {
          width: 240px;
          height: 240px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.16);
          animation-delay: 4s;
        }

        .splash-glass {
          position: relative;
          z-index: 2;
          width: min(92%, 470px);
          padding: 38px 30px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          text-align: center;
        }

        .splash-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .splash-logo {
          width: 82px;
          height: 82px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          font-size: 26px;
          font-weight: 800;
          color: white;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .splash-title {
          margin: 0;
          color: #ffffff;
          font-size: clamp(26px, 4vw, 32px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .splash-text {
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.88);
          font-size: 15px;
          line-height: 1.7;
        }

        .splash-loader {
          margin-top: 26px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .splash-loader span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          animation: bounce 1.2s infinite ease-in-out;
        }

        .splash-loader span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .splash-loader span:nth-child(3) {
          animation-delay: 0.10s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(20px) translateX(10px) scale(1.05);
          }
        }
      `}</style>
    </main>
  );
}