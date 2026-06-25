export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  matricNumber?: string;
  phoneNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  department?: string;
  college?: string;
  level?: '100 Level' | '200 Level' | '300 Level' | '400 Level' | '500 Level';
  semester?: 'First Semester' | 'Second Semester';
  session?: string;
  profileImage?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  issueSemester: string;
  issueSession: string;
  issueLevel: string;
  status: 'Pending' | 'In Review' | 'Resolved' | 'Rejected';
  anonymous: boolean;
  reporterId: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
