import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmdMEmngOFxbnMeWq8I46CrmCuF1EXn8k",
  authDomain: "online-student-grievance.firebaseapp.com",
  projectId: "online-student-grievance",
  storageBucket: "online-student-grievance.firebasestorage.app",
  messagingSenderId: "729102163263",
  appId: "1:729102163263:web:1094cd8a0d7f640f7e878a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function submitGrievance(data: {
  title: string;
  description: string;
  category: string;
  department: string;
  issueSemester: string;
  issueSession: string;
  issueLevel: string;
  anonymous: boolean;
  reporterId: string;
  reporterName: string;
}) {
  return await addDoc(collection(db, "complaints"), {
    title: data.title || "",
    description: data.description || "",
    category: data.category || "",
    department: data.department || "",
    issueSemester: data.issueSemester || "",
    issueSession: data.issueSession || "",
    issueLevel: data.issueLevel || "",
    anonymous: Boolean(data.anonymous),
    reporterId: data.anonymous ? null : data.reporterId || null,
    reporterName: data.anonymous ? null : data.reporterName || null,
    status: "Pending",
    response: "",
    createdAt: serverTimestamp(),
  });
}