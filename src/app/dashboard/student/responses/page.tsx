'use client';

import { useEffect, useState } from 'react';

type ResponseItem = {
  _id: string;
  responseText: string;
  staffName?: string;
  createdAt?: string;
};

type Complaint = {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt?: string;
  responses?: ResponseItem[];
  response?: string;
  staffName?: string;
};

export default function StudentResponsesPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    setStudentId(storedStudentId);
  }, []);

  useEffect(() => {
    if (!studentId) {
      if (typeof window !== 'undefined') {
        setLoading(false);
        setError('Student session not found. Please log in again.');
      }
      return;
    }

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/student/complaints/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId }),
        });

        if (!res.ok) {
          throw new Error('Failed to load responses');
        }

        const data = await res.json();
        setComplaints(data.complaints || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">My Complaint Responses</h1>
          <p className="text-gray-600">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">My Complaint Responses</h1>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">My Complaint Responses</h1>

        {complaints.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-600">You have not received any responses yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="rounded-2xl bg-white p-6 shadow-md">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{complaint.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Status: <span className="font-medium">{complaint.status}</span>
                    </p>
                  </div>
                  {complaint.createdAt && (
                    <p className="text-sm text-gray-400">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">Your Complaint</p>
                  <p className="mt-2 text-gray-600">{complaint.description}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-700">Staff Response</p>

                  {complaint.responses && complaint.responses.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {complaint.responses.map((resp) => (
                        <div
                          key={resp._id}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"
                        >
                          <p className="text-gray-800">{resp.responseText}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>{resp.staffName ? `By ${resp.staffName}` : 'By Staff'}</span>
                            {resp.createdAt && (
                              <span>{new Date(resp.createdAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : complaint.response ? (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-gray-800">{complaint.response}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {complaint.staffName ? `By ${complaint.staffName}` : 'By Staff'}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">No response yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}