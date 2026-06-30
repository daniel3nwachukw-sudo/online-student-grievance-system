'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/signin');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash-bg">
      <div className="splash-blob splash-blob-one" />
      <div className="splash-blob splash-blob-two" />

      <section className="splash-glass">
        <div className="splash-logo">GS</div>

        <h1 className="splash-title">Online Student Grievance System</h1>

        <p className="splash-text">
          Report issues, track complaints, and stay updated in one place.
        </p>

        <div className="splash-loader">
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
          filter: blur(70px);
          opacity: 0.55;
          animation: float 10s ease-in-out infinite;
        }

        .splash-blob-one {
          width: 320px;
          height: 320px;
          top: -60px;
          left: -80px;
          background: rgba(14, 165, 233, 0.6);
        }

        .splash-blob-two {
          width: 360px;
          height: 360px;
          bottom: -100px;
          right: -90px;
          background: rgba(16, 185, 129, 0.6);
          animation-delay: 2s;
        }

        .splash-glass {
          position: relative;
          z-index: 2;
          width: min(92%, 460px);
          padding: 36px 28px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          text-align: center;
        }

        .splash-logo {
          width: 78px;
          height: 78px;
          margin: 0 auto 18px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          font-size: 24px;
          font-weight: 800;
          color: white;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .splash-title {
          margin: 0;
          color: #fff;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 800;
        }

        .splash-text {
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.88);
          font-size: 15px;
          line-height: 1.7;
        }

        .splash-loader {
          margin-top: 24px;
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
          animation-delay: 0.3s;
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