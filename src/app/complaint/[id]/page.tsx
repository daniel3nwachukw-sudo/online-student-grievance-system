'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type Complaint = {
  id: string;
  title: string;
  status: string;
  category: string;
  department: string;
  issueLevel: string;
  issueSemester: string;
  issueSession: string;
  description: string;
  reporterName?: string;
};

export default function ComplaintDetailsPage() {

  console.log('DETAIL PAGE LOADED');

  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComplaint() {
      if (!id) return;

      try {
        const complaintRef = doc(db, 'complaints', id);
        const complaintSnap = await getDoc(complaintRef);

        if (complaintSnap.exists()) {
          setComplaint({
            id: complaintSnap.id,
            ...(complaintSnap.data() as Omit<Complaint, 'id'>),
          });
        } else {
          setComplaint(null);
        }
      } catch (error) {
        console.error('Error fetching complaint:', error);
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    }

    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>Loading complaint...</p>
      </main>
    );
  }

 if (!complaint) {
  console.log('Complaint not found for ID:', id);

  return (
    <main className="p-6">
      <h1>Complaint not found</h1>
      <p>ID: {id}</p>
    </main>
  );
}

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="rounded-xl border bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          {complaint.title}
        </h1>

        <div className="space-y-3">
          <p>
            <strong>Status:</strong> {complaint.status}
          </p>

          <p>
            <strong>Category:</strong> {complaint.category}
          </p>

          <p>
            <strong>Department:</strong> {complaint.department}
          </p>

          <p>
            <strong>Level:</strong> {complaint.issueLevel}
          </p>

          <p>
            <strong>Semester:</strong> {complaint.issueSemester}
          </p>

          <p>
            <strong>Session:</strong> {complaint.issueSession}
          </p>

          <p>
            <strong>Submitted By:</strong>{' '}
            {complaint.reporterName || 'Anonymous'}
          </p>

          <div>
            <strong>Description:</strong>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4">
              {complaint.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}