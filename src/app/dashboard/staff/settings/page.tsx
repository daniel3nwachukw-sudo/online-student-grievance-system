'use client';

import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';

export default function StaffSettingsPage() {
  return (
    <DashboardLayout
      title="Staff Settings"
      sidebar={<StaffSidebar />}
    >
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Staff Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Account */}
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Account
          </h2>

          <p className="text-gray-500">
            Update your profile information and password.
          </p>

          <button
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Notifications
          </h2>

          <p className="text-gray-500">
            Notification preferences will be available soon.
          </p>
        </div>

        {/* Security */}
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Security
          </h2>

          <p className="text-gray-500">
            Security settings will be available soon.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}