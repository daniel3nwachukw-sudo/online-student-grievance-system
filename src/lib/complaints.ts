import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export type ComplaintData = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  anonymous?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export async function loadComplaint(complaintId: string): Promise<ComplaintData | null> {
  const complaintSnap = await getDoc(doc(db, 'complaints', complaintId));
  if (!complaintSnap.exists()) return null;
  return { id: complaintSnap.id, ...(complaintSnap.data() as Omit<ComplaintData, 'id'>) };
}

export async function createComplaint(
  complaint: Omit<ComplaintData, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'complaints'), {
    ...complaint,
    status: 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateComplaint(
  complaintId: string,
  data: Partial<Omit<ComplaintData, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'complaints', complaintId), {
    ...data,
    updatedAt: serverTimestamp(),
  } as DocumentData);
}

export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  userId?: string
): Promise<void> {
  await updateDoc(doc(db, 'complaints', complaintId), {
    status,
    updatedAt: serverTimestamp(),
  });

  if (userId) {
    await addDoc(collection(db, 'notifications'), {
      userId,
      complaintId,
      message: `Your complaint status has been updated to ${status}`,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function deleteComplaint(complaintId: string): Promise<void> {
  await deleteDoc(doc(db, 'complaints', complaintId));
}