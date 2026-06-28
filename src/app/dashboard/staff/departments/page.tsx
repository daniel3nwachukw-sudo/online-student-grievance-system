'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type Department = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'departments'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Department[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name ?? '',
            description: data.description ?? '',
            createdAt: data.createdAt ?? '',
          });
        });

        setDepartments(list);
        setLoading(false);
      },
      () => {
        setDepartments([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Departments</h1>
        <p className="mt-2 text-gray-500">
          View the departments available in the grievance system.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="p-6 text-slate-500">No departments found.</div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="border-b border-slate-200 p-4 last:border-b-0">
              <h2 className="text-lg font-semibold text-slate-900">{dept.name}</h2>
              <p className="mt-1 text-slate-700">{dept.description || 'No description available.'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}