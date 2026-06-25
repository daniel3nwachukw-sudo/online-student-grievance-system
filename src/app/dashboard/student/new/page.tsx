'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { checkModeration } from '@/src/lib/moderation';
import { submitGrievance } from '@/src/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const categories = ['Academic', 'Facilities', 'Safety', 'Staff', 'Examination', 'Other'];
const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];
const semesters = ['First Semester', 'Second Semester'];

export default function NewComplaintPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('Academic');
  const [department, setDepartment] = useState('');
  const [issueSemester, setIssueSemester] = useState('First Semester');
  const [issueSession, setIssueSession] = useState('2025/2026');
  const [issueLevel, setIssueLevel] = useState('100 Level');
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

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

  if (!department.trim()) {
    setMessage('Please select the department where the issue occurred.');
    return;
  }

  if (!user) {
    setMessage('Please sign in before submitting a complaint.');
    return;
  }

  const {
    isFlagged,
    keywords,
    severity: sev,
    warning,
  } = checkModeration(title + ' ' + description);

  if (anonymous && isFlagged) {
    setSeverity(sev ?? null);
    setMessage(
      `Submission blocked: ${warning} Keywords: ${keywords.join(', ')}`
    );
    return;
  }

  setLoading(true);

  try {
    await submitGrievance({
      title,
      description,
      category,
      department,
      issueSemester,
      issueSession,
      issueLevel,
      anonymous,

      reporterId: anonymous
        ? 'anonymous'
        : user.uid,

      reporterName: anonymous
        ? 'Anonymous'
        : user.displayName ||
          user.email ||
          'Unknown Student',
    });

    router.push('/dashboard/student');
  } catch (error) {
    setMessage(
      'Failed to submit complaint. Please try again.'
    );
    console.error(error);
  } finally {
    setLoading(false);
  }
}
  return (
    <main className="container">
      <section className="rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="page-heading">Submit a New Complaint</h1>
        <p className="text-slate-600 mb-6">Select the issue details and attach evidence. Anonymous reports hide your student identity.</p>

        <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Complaint Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-300 p-4">
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Department</span>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} required className="rounded-2xl border border-slate-300 p-4" placeholder="e.g. Computer Science" />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Current Level</span>
              <select value={issueLevel} onChange={(e) => setIssueLevel(e.target.value)} className="rounded-2xl border border-slate-300 p-4">
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Issue Semester</span>
              <select value={issueSemester} onChange={(e) => setIssueSemester(e.target.value)} className="rounded-2xl border border-slate-300 p-4">
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="font-medium">Academic Session</span>
            <input value={issueSession} onChange={(e) => setIssueSession(e.target.value)} required className="rounded-2xl border border-slate-300 p-4" placeholder="2025/2026" />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-2xl border border-slate-300 p-4" />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required className="rounded-2xl border border-slate-300 p-4" />
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span>Submit anonymously</span>
          </label>

          <label className="grid gap-2">
            <span className="font-medium">Attachments</span>
            <input type="file" multiple onChange={handleFileChange} />
            <small className="text-slate-500">Max {MAX_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)} MB each.</small>
          </label>

          {message && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</div>}
          {severity && <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">Detected severity: {severity}</div>}

          <div className="flex items-center justify-end">
            <button type="submit" disabled={loading} className="rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}