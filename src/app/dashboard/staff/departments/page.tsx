'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import StaffGuard from '@/src/components/auth/StaffGuard';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StaffSidebar from '@/src/components/dashboard/StaffSidebar';

type Department = {
  id: string;
  name: string;
  description?: string;
  studentCount?: number;
};

export default function DepartmentsPage() {
  const [catalog, setCatalog] = useState<Department[]>([]);
  const [studentDepartments, setStudentDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishedSources = new Set<string>();
    const finishSource = (source: string) => {
      finishedSources.add(source);
      if (finishedSources.size === 2) setLoading(false);
    };

    const unsubscribeCatalog = onSnapshot(
      collection(db, 'departments'),
      (snapshot) => {
        const list: Department[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name ?? '',
            description: data.description ?? '',
          });
        });

        setCatalog(list.filter((department) => department.name.trim()));
        finishSource('catalog');
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Failed to load department list.');
        finishSource('catalog');
      }
    );

    const unsubscribeStudents = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const counts = new Map<string, { name: string; count: number }>();

        snapshot.forEach((userDoc) => {
          const user = userDoc.data();
          const name = typeof user.department === 'string' ? user.department.trim() : '';
          if (user.role !== 'student' || !name) return;

          const key = name.toLocaleLowerCase();
          const current = counts.get(key);
          counts.set(key, { name: current?.name || name, count: (current?.count || 0) + 1 });
        });

        setStudentDepartments(
          Array.from(counts.entries()).map(([key, department]) => ({
            id: `students-${key}`,
            name: department.name,
            studentCount: department.count,
          }))
        );
        finishSource('students');
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Failed to load student departments.');
        finishSource('students');
      }
    );

    return () => {
      unsubscribeCatalog();
      unsubscribeStudents();
    };
  }, []);

  const departments = useMemo(() => {
    const merged = new Map<string, Department>();

    catalog.forEach((department) => {
      merged.set(department.name.trim().toLocaleLowerCase(), department);
    });

    studentDepartments.forEach((department) => {
      const key = department.name.trim().toLocaleLowerCase();
      const existing = merged.get(key);
      merged.set(key, {
        ...existing,
        id: existing?.id || department.id,
        name: existing?.name || department.name,
        studentCount: department.studentCount,
      });
    });

    return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog, studentDepartments]);

  return (
    <StaffGuard>
      <DashboardLayout title="Departments" sidebar={<StaffSidebar />}>
        <div className="space-y-6">
          <p className="text-slate-600">Departments configured in the system and currently used by students.</p>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border bg-white shadow-sm">
            {loading ? (
              <div className="p-6 text-slate-500">Loading departments...</div>
            ) : departments.length === 0 ? (
              <div className="p-6 text-slate-500">No departments found.</div>
            ) : (
              departments.map((dept) => (
                <div key={dept.id} className="border-b border-slate-200 p-4 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{dept.name}</h2>
                    {typeof dept.studentCount === 'number' ? (
                      <span className="text-sm text-slate-500">
                        {dept.studentCount} {dept.studentCount === 1 ? 'student' : 'students'}
                      </span>
                    ) : null}
                  </div>
                  {dept.description ? (
                    <p className="mt-1 text-slate-700">{dept.description}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </StaffGuard>
  );
}