import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-50 to-brand-50 py-20">
        <div className="container grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Student Grievance Portal
            </h1>

            <p className="text-xl text-slate-600 mb-8">
              A secure platform for submitting grievances and tracking complaint status online.
            </p>

            <div className="flex gap-4">
              <Link
                href="/signin"
                className="rounded-full bg-brand-700 px-8 py-3 text-white font-semibold hover:bg-brand-800 shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Key Features
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: '📝',
                title: 'Lodge Grievance',
                desc: 'Submit complaints about academic or admin issues',
              },
              {
                icon: '🔍',
                title: 'Track Complaint',
                desc: 'Monitor status of submitted grievances',
              },
              {
                icon: '📢',
                title: 'Notices & Updates',
                desc: 'Stay informed with latest announcements',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 text-center shadow-lg border"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 text-center">
        <p>© {new Date().getFullYear()} UNIPORTAL</p>
      </footer>
    </>
  );
}