'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { checkModeration } from '@/src/lib/moderation';
import { submitGrievance } from '@/src/lib/firebase';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import StudentSidebar from '@/src/components/dashboard/StudentSidebar';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const categories = ['Academic', 'Facilities', 'Safety', 'Staff', 'Examination', 'Other'];
const semesters = ['First Semester', 'Second Semester'];

export default function AnonymousComplaintPage() {
  const router = useRouter();
  const { profile } = useUserProfile();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('Academic');
  const [issueSemester, setIssueSemester] = useState(profile?.semester || 'First Semester');
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (profile?.semester) {
      setIssueSemester(profile.semester);
    }
  }, [profile]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setMessage(null);
    const list = e.target.files;
    if (!list) return;

    const arr = Array.from(list);

    if (arr.length > MAX_FILES) {
      setMessage(`You can upload up to ${MAX_FILES} files.`);
      return;
    }

    for (const f of arr) {
      if (f.size > MAX_FILE_SIZE) {
        setMessage(`File "${f.name}" is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
        return;
      }
    }

    setFiles(arr);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!user) {
      setMessage('Please sign in before submitting a complaint.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setMessage('Please fill in the title and description.');
      return;
    }

    const department = profile?.department || '';
    const issueLevel = profile?.level || '';
    const studentName =
      profile?.fullName ||
      profile?.name ||
      user.displayName ||
      user.email ||
      'Unknown Student';

    if (!department.trim()) {
      setMessage('Your profile is missing a department. Please update your profile first.');
      return;
    }

    if (!issueLevel.trim()) {
      setMessage('Your profile is missing a level. Please update your profile first.');
      return;
    }

    const { isFlagged, keywords, severity: sev, warning } = checkModeration(
      title + ' ' + description
    );

    if (isFlagged) {
      setSeverity(sev ?? null);
      setMessage(`Submission blocked: ${warning} Keywords: ${keywords.join(', ')}`);
      return;
    }

    setLoading(true);

    try {await submitGrievance({
  title,
  description,
  category,
  department,
  issueSemester,
  issueSession: profile?.session || '2025/2026',
  issueLevel,
  anonymous: true,
  reporterId: 'anonymous',
  reporterName: 'Anonymous',
});

      router.push('/dashboard/student');
    } catch (error: any) {
      console.error('SUBMIT ERROR:', error);
      setMessage(error?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout sidebar={<StudentSidebar />}>
      <section className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-4 shadow-lg sm:rounded-3xl sm:p-6 lg:p-10">
        <div className="mb-5 flex flex-col items-start gap-3 sm:mb-6 sm:flex-row sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">Submit Anonymous Complaint</h1>
            <p className="text-sm leading-6 text-slate-600 sm:text-base">
              Your identity will be hidden, but your profile details will still be used internally.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 sm:px-4 sm:py-2 sm:text-sm">
            Anonymous Mode
          </span>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:mb-6 sm:grid-cols-2 sm:gap-4 sm:rounded-3xl sm:p-5">
          <div>
            <p className="text-sm text-slate-500">Student Name</p>
            <p className="break-words font-medium text-slate-900">
              {profile?.fullName || profile?.name || user?.displayName || user?.email || 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Department</p>
            <p className="break-words font-medium text-slate-900">{profile?.department || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Level</p>
            <p className="font-medium text-slate-900">{profile?.level || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Session</p>
            <p className="font-medium text-slate-900">{profile?.session || '2025/2026'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:gap-6 sm:rounded-3xl sm:p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Complaint Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-w-0 rounded-2xl border border-slate-300 p-3 sm:p-4"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-medium">Issue Semester</span>
              <select
                value={issueSemester}
                onChange={(e) => setIssueSemester(e.target.value)}
                className="w-full min-w-0 rounded-2xl border border-slate-300 p-3 sm:p-4"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="font-medium">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full min-w-0 rounded-2xl border border-slate-300 p-3 sm:p-4"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
              className="w-full min-w-0 rounded-2xl border border-slate-300 p-3 sm:p-4"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">Attachments</span>
            <input className="block w-full min-w-0 text-sm" type="file" multiple onChange={handleFileChange} />
            <small className="text-sm text-slate-500">
              Max {MAX_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)} MB each.
            </small>
          </label>

          {message && (
            <div className="break-words rounded-md bg-red-50 p-3 text-sm text-red-700">
              {message}
            </div>
          )}

          {severity && (
            <div className="break-words rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              Detected severity: {severity}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800 disabled:opacity-60 sm:w-auto"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  );
}