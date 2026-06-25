import Link from 'next/link';

export default function SelectRolePage() {
  return (
    <main className="container">
      <section className="rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="page-heading">Select Role</h1>
        <p className="text-slate-600 mb-6">Choose your role to continue:</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signin?role=student" className="rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800">
            Student Login
          </Link>
          <Link href="/signin?role=admin" className="rounded-full border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50">
            Staff Login
          </Link>
        </div>
      </section>
    </main>
  );
}