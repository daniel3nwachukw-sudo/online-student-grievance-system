'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/src/lib/firebase';

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
  department?: string;
};

type UseComplaintsResult = {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
};

type UseComplaintsOptions = {
  mode?: 'student' | 'staff' | 'all';
  studentId?: string;
  department?: string;
};

export function useComplaints(options: UseComplaintsOptions = {}): UseComplaintsResult {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    let cancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          if (!cancelled) {
            setComplaints([]);
            setError('No authenticated user found.');
            setLoading(false);
          }
          return;
        }

        const userSnap = await getDoc(doc(db, 'users', user.uid));

        if (!userSnap.exists()) {
          if (!cancelled) {
            setComplaints([]);
            setError('User profile not found.');
            setLoading(false);
          }
          return;
        }

        const userData = userSnap.data();
        const role = userData.role as string | undefined;
        const mode = options.mode || 'student';

        if (mode === 'student' && role !== 'student') {
          if (!cancelled) {
            setComplaints([]);
            setError('This view is for students only.');
            setLoading(false);
          }
          return;
        }

        if (mode === 'staff' && role !== 'staff' && role !== 'admin') {
          if (!cancelled) {
            setComplaints([]);
            setError('This view is for staff only.');
            setLoading(false);
          }
          return;
        }

        if (mode === 'all' && role !== 'staff' && role !== 'admin') {
          if (!cancelled) {
            setComplaints([]);
            setError('This view is for staff only.');
            setLoading(false);
          }
          return;
        }

        unsubscribeSnapshot?.();

        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

        if (mode === 'student') {
          const id = options.studentId || user.uid;
          constraints.unshift(where('studentId', '==', id));
        }

        if (mode === 'staff' && options.department) {
          constraints.unshift(where('department', '==', options.department));
        }

        const q = query(collection(db, 'complaints'), ...constraints);

        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            if (cancelled) return;

            const items = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                title: data.title || data.complaintTitle || '',
                description: data.description || '',
                category: data.category || '',
                status: data.status || 'Pending',
                createdAt: data.createdAt || null,
                studentId: data.studentId || '',
                anonymous: Boolean(data.anonymous),
                department: data.department || '',
              };
            });

            setComplaints(items);
            setError(null);
            setLoading(false);
          },
          (err) => {
            if (cancelled) return;
            setComplaints([]);
            setError(err.message || 'Failed to load complaints.');
            setLoading(false);
          }
        );
      } catch (err: any) {
        if (cancelled) return;
        setComplaints([]);
        setError(err?.message || 'Something went wrong.');
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [options.mode, options.studentId, options.department]);

  return { complaints, loading, error };
}