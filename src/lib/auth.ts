import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

export function onAuthStateChangedListener(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

// SIGN IN
export async function signIn(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  return {
    uid: result.user.uid,
    email: result.user.email ?? '',
  };
}

// SIGN UP + CREATE FIRESTORE PROFILE
export async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  const cr = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (displayName) {
    await updateProfile(cr.user, {
      displayName,
    });
  }

  await setDoc(doc(db, 'users', cr.user.uid), {
    id: cr.user.uid,
    email,
    role: 'student', // ALWAYS STUDENT
    fullName: displayName ?? '',
    createdAt: new Date().toISOString(),
  });

  return {
    uid: cr.user.uid,
    email: cr.user.email ?? '',
    role: 'student',
  };
}

// GET USER PROFILE
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

// SIGN OUT
export async function signOut() {
  return firebaseSignOut(auth);
}

// CURRENT USER
export function getCurrentUser() {
  return auth.currentUser;
}

// RESET PASSWORD
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}