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
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';


// =========================
// AUTH LISTENER
// =========================
export function onAuthStateChangedListener(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}


// =========================
// SIGN IN
// =========================
export async function signIn(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  return {
    uid: result.user.uid,
    email: result.user.email ?? '',
  };
}


// =========================
// SIGN UP (LOCKED ROLE)
// =========================
export async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  const userCred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCred.user;

  if (displayName) {
    await updateProfile(user, {
      displayName,
    });
  }

  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    email: user.email,
    fullName: displayName ?? '',
    role: 'student', // 🔒 NEVER CHANGED HERE
    createdAt: serverTimestamp(),
  });

  return {
    uid: user.uid,
    email: user.email ?? '',
    role: 'student',
  };
}


// =========================
// GET USER PROFILE
// =========================
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));

  if (!snap.exists()) return null;

  return snap.data();
}


// =========================
// SIGN OUT
// =========================
export async function signOut() {
  return firebaseSignOut(auth);
}


// =========================
// CURRENT USER
// =========================
export function getCurrentUser() {
  return auth.currentUser;
}


// =========================
// RESET PASSWORD
// =========================
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}


// =========================
// 🔐 ADMIN: PROMOTE USER TO STAFF
// =========================
export async function promoteToStaff(userId: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'staff',
  });
}


// =========================
// 🔐 ADMIN: DEMOTE USER
// =========================
export async function demoteToStudent(userId: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'student',
  });
}