'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export type Complaint = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
  studentId?: string;
  anonymous?: boolean;
};

type UseComplaintResult = {
  complaint: Complaint | null;
  loading: boolean;
  error: string | null;
};

export function useComplaint(complaintId?: string): UseComplaintResult {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) {
      setComplaint(null);
      setError('Complaint ID is required.');
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'complaints', complaintId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setComplaint(null);
          setError('Complaint not found.');
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setComplaint({
          id: snapshot.id,
          title: data.title || data.complaintTitle || '',
          description: data.description || '',
          category: data.category || '',
          status: data.status || 'Pending',
          createdAt: data.createdAt || null,
          studentId: data.studentId || '',
          anonymous: Boolean(data.anonymous),
        });

        setError(null);
        setLoading(false);
      },
      (err) => {
        setComplaint(null);
        setError(err.message || 'Failed to load complaint.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [complaintId]);

  return { complaint, loading, error };
}