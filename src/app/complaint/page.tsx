'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplaint() {
      try {
        const snap = await getDoc(
          doc(db, 'complaints', id)
        );

        if (snap.exists()) {
          setComplaint({
            id: snap.id,
            ...snap.data(),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadComplaint();
    }
  }, [id]);

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }

  if (!complaint) {
    return (
      <main className="p-6">
        Complaint not found.
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Complaint Details
      </h1>

      <div className="border rounded-xl p-6 bg-white shadow">
        <p><strong>Title:</strong> {complaint.title}</p>

        <p className="mt-3">
          <strong>Category:</strong> {complaint.category}
        </p>

        <p className="mt-3">
          <strong>Department:</strong> {complaint.department}
        </p>

        <p className="mt-3">
          <strong>Status:</strong> {complaint.status}
        </p>

        <p className="mt-3">
          <strong>Level:</strong> {complaint.issueLevel}
        </p>

        <p className="mt-3">
          <strong>Semester:</strong> {complaint.issueSemester}
        </p>

        <p className="mt-3">
          <strong>Session:</strong> {complaint.issueSession}
        </p>

        <p className="mt-5">
          <strong>Description:</strong>
        </p>

        <div className="border rounded p-4 mt-2 bg-gray-50">
          {complaint.description}
        </div>
      </div>
    </main>
  );
}