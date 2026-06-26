'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-3 hover:bg-slate-100 transition"
      >
        <Bell className="w-6 h-6 text-slate-700" />

        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white font-bold">
          3
        </span>
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-200 bg-white shadow-2xl z-50">

          <div className="border-b px-5 py-4">
            <h3 className="font-bold text-slate-800">
              Notifications
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">

            <div className="px-5 py-4 hover:bg-slate-50 cursor-pointer border-b">
              <p className="font-medium">
                Complaint Updated
              </p>

              <p className="text-sm text-slate-500">
                Your complaint is now In Progress.
              </p>
            </div>

            <div className="px-5 py-4 hover:bg-slate-50 cursor-pointer border-b">
              <p className="font-medium">
                New Announcement
              </p>

              <p className="text-sm text-slate-500">
                Semester registration has begun.
              </p>
            </div>

            <div className="px-5 py-4 hover:bg-slate-50 cursor-pointer">
              <p className="font-medium">
                Welcome
              </p>

              <p className="text-sm text-slate-500">
                Welcome to the Online Student Grievance System.
              </p>
            </div>

          </div>

          <div className="border-t px-5 py-3 text-center">
            <button className="text-blue-600 hover:underline">
              View All Notifications
            </button>
          </div>

        </div>
      )}

    </div>
  );
}