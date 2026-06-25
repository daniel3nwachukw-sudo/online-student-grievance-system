import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  type DocumentData,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { db, storage } from './firebase';
import type { UserProfile } from './types';

// ===============================
// LOAD USER PROFILE
// ===============================
export async function loadUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    return null;
  }

  return userDoc.data() as UserProfile;
}

// ===============================
// SAVE USER PROFILE
// ===============================
export async function saveUserProfile(
  profile: UserProfile
): Promise<void> {
  const profileRef = doc(db, 'users', profile.id);

  await setDoc(
    profileRef,
    profile as DocumentData,
    {
      merge: true,
    }
  );
}

// ===============================
// UPLOAD PROFILE IMAGE
// ===============================
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const imageRef = ref(
    storage,
    `profileImages/${userId}`
  );

  const uploadResult = await uploadBytes(
    imageRef,
    file
  );

  return getDownloadURL(uploadResult.ref);
}

// ===============================
// BUILD PROFILE DOCUMENT
// ===============================
export function buildProfileDocument(
  profile: Partial<UserProfile> & {
    id: string;
    email: string;
    role: string;
  }
): UserProfile {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as UserProfile['role'],
    fullName: profile.fullName ?? '',
    matricNumber: profile.matricNumber ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    gender: profile.gender ?? undefined,
    department: profile.department ?? '',
    college: profile.college ?? '',
    level: profile.level ?? '100 Level',
    semester: profile.semester ?? 'First Semester',
    session: profile.session ?? '',
    profileImage: profile.profileImage ?? '',
  };
}

// ===============================
// UPDATE COMPLAINT STATUS
// ===============================
export async function updateComplaintStatus(
  complaintId: string,
  status: 'Pending' | 'In Progress' | 'Resolved',
  userId?: string
): Promise<void> {
  const complaintRef = doc(
    db,
    'complaints',
    complaintId
  );

  await updateDoc(complaintRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  if (userId) {
    await addDoc(
      collection(db, 'notifications'),
      {
        userId,
        complaintId,
        message: `Your complaint status has been updated to ${status}`,
        read: false,
        createdAt: new Date(),
      }
    );
  }
}

// ===============================
// DELETE COMPLAINT
// ===============================
export async function deleteComplaint(
  complaintId: string
): Promise<void> {
  await deleteDoc(
    doc(db, 'complaints', complaintId)
  );
}