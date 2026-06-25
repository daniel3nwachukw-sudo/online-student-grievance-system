'use client';

import Link from "next/link";
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { loadUserProfile, saveUserProfile, uploadProfileImage } from '@/src/lib/user';
import type { UserProfile } from '@/src/lib/types';

const genders = ['Male', 'Female', 'Other'] as const;
const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'] as const;
const semesters = ['First Semester', 'Second Semester'] as const;

const initialProfile: UserProfile = {
  id: '',
  email: '',
  fullName: '',
  role: 'student',
  matricNumber: '',
  phoneNumber: '',
  gender: 'Male',
  department: '',
  college: '',
  level: '100 Level',
  semester: 'First Semester',
  session: '',
  profileImage: '',
};

export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthUser(null);
        setLoading(false);
        return;
      }

      setAuthUser(user);
      const existingProfile = await loadUserProfile(user.uid);
      setProfile({
        ...initialProfile,
        id: user.uid,
        email: user.email ?? '',
        fullName: user.displayName ?? '',
        role: 'student',
        ...existingProfile,
      });
      setPreviewImage(existingProfile?.profileImage ?? null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    if (!files?.length) return;
    const file = files[0];
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (!authUser) {
      setMessage('Please sign in before updating your profile.');
      return;
    }

    if (!profile.fullName || !profile.matricNumber || !profile.email || !profile.phoneNumber || !profile.department || !profile.college || !profile.session) {
      setMessage('Please complete all required fields before saving.');
      return;
    }

    setSaving(true);

    try {
      let profileImageUrl = profile.profileImage;

      if (imageFile) {
        profileImageUrl = await uploadProfileImage(authUser.uid, imageFile);
      }

      await saveUserProfile({
        ...profile,
        profileImage: profileImageUrl,
        id: authUser.uid,
        email: authUser.email ?? profile.email,
        role: 'student',
      });

      setMessage('Profile saved successfully.');
    } catch (error) {
      setMessage('Unable to save your profile. Please try again later.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="container">
        <section className="rounded-3xl bg-white p-10 shadow-lg">
          <h1 className="page-heading">Profile</h1>
          <p className="text-slate-600">Loading your account...</p>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="container">
        <section className="rounded-3xl bg-white p-10 shadow-lg">
          <h1 className="page-heading">Profile</h1>
          <p className="text-slate-600 mb-6">You must sign in to manage your student profile.</p>
          <Link href="/signin" className="rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="rounded-3xl bg-white p-10 shadow-lg">
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_2fr] md:items-end md:gap-10">
          <div>
            <p className="text-sm uppercase tracking-[.3em] text-brand-700">Student Profile</p>
            <h1 className="page-heading">Edit your profile</h1>
            <p className="text-slate-600">Update your academic details, contact information, and profile picture.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl text-slate-500">{profile.fullName?.[0] ?? 'S'}</span>
                )}
              </div>
              <div>
                <p className="font-semibold">Upload profile picture</p>
                <p className="text-sm text-slate-500">PNG or JPG, max 5MB.</p>
              </div>
            </div>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Change image
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm text-slate-600" />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Full Name</span>
              <input name="fullName" value={profile.fullName} onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" />
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Matric Number</span>
              <input name="matricNumber" value={profile.matricNumber} onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Email Address</span>
              <input name="email" value={profile.email} type="email" onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" />
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Phone Number</span>
              <input name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Gender</span>
              <select name="gender" value={profile.gender} onChange={handleChange} className="rounded-2xl border border-slate-300 p-4">
                {genders.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Department</span>
              <input name="department" value={profile.department} onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">College / Faculty</span>
              <input name="college" value={profile.college} onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" />
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Level</span>
              <select name="level" value={profile.level} onChange={handleChange} className="rounded-2xl border border-slate-300 p-4">
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">Semester</span>
              <select name="semester" value={profile.semester} onChange={handleChange} className="rounded-2xl border border-slate-300 p-4">
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="font-medium">Academic Session</span>
              <input name="session" value={profile.session} onChange={handleChange} required className="rounded-2xl border border-slate-300 p-4" placeholder="2025/2026" />
            </label>
          </div>

          {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving profile...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
