'use client';

import Link from 'next/link';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';

export default function StaffSettingsPage() {
  return (
    <DashboardLayout title="Staff Settings" sidebar={<StaffSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-gray-500">
            Manage your staff account settings and preferences.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Account</h2>
          <p className="text-gray-500">
            Update your staff profile information, name, phone number, and department.
          </p>

          <Link
            href="/dashboard/staff/settings/edit-profile"
            className="mt-4 inline-flex rounded-lg bg-blue-900 px-5 py-2 text-white transition hover:bg-blue-800"
          >
            Edit Profile
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Notifications</h2>
          <p className="text-gray-500">Notification preferences will be available soon.</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Security</h2>
          <p className="text-gray-500">Security settings will be available soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}