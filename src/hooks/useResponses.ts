'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export type ResponseItem = {
  id: string;
  complaintId?: string;
  complaintTitle?: string;
  response?: string;
  status?: string;
  studentId?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
};

type UseResponsesResult = {
  responses: ResponseItem[];
  loading: boolean;
  error: string | null;
};

export function useResponses(studentId?: string): UseResponsesResult {
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setResponses([]);
      setError('Student ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'responses'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setResponses(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              complaintId: data.complaintId || '',
              complaintTitle: data.complaintTitle || '',
              response: data.response || '',
              status: data.status || 'New',
              studentId: data.studentId || studentId,
              createdAt: data.createdAt || null,
            };
          })
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        setResponses([]);
        setError(err.message || 'Failed to load responses.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  return { responses, loading, error };
}