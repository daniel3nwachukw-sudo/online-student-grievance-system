'use client';

import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';
import StatCard from '@/src/components/dashboard/StatCard';
import Link from 'next/link';

export default function StaffDashboardPage() {
  return (
    <DashboardLayout
      title="Staff Dashboard"
      sidebar={<StaffSidebar />}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          
        
        </h1>

        <p className="text-gray-500 mt-2">
          Manage assigned student complaints.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assigned"
          value={0}
          color="text-blue-600"
        />

        <StatCard
          title="Pending"
          value={0}
          color="text-yellow-600"
        />

        <StatCard
          title="In Progress"
          value={0}
          color="text-indigo-600"
        />

        <StatCard
          title="Resolved"
          value={0}
          color="text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="flex gap-4 flex-wrap">

          <Link
            href="/dashboard/staff/reports"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            View Assigned Complaints
          </Link>

          <Link
            href="/notifications"
            className="bg-green-600 text-white px-5 py-3 rounded-lg"
          >
            Notifications
          </Link>

        </div>
      </div>

      {/* Assigned Complaints */}
      <div className="bg-white rounded-xl border shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Assigned Complaints
        </h2>

        <p className="text-gray-500">
          No complaints have been assigned yet.
        </p>
      </div>

    </DashboardLayout>
  );
}