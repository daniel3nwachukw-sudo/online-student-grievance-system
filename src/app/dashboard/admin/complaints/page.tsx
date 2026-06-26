'use client';

import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import AdminSidebar from '@/src/components/dashboard/AdminSidebar';

export default function AdminComplaintsPage() {
  return (
    <DashboardLayout
      title="Complaint Management"
      sidebar={<AdminSidebar />}
    >
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Complaint Management
          </h1>

          <p className="text-gray-500 mt-2">
            View, monitor and manage all complaints submitted by students.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="Search complaints..."
              className="flex-1 border rounded-lg px-4 py-3"
            />

            <select className="border rounded-lg px-4 py-3">
              <option>All Status</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

          </div>
        </div>

        {/* Complaint Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="text-left p-4">
                  Complaint
                </th>

                <th className="text-left p-4">
                  Student
                </th>

                <th className="text-left p-4">
                  Department
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td className="p-4" colSpan={5}>
                  <div className="text-center py-16 text-gray-500">
                    No complaints available yet.
                  </div>
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>
    </DashboardLayout>
  );
}