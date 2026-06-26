'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';

type UserData = {
  id: string;
  fullName: string;
  email: string;
  department?: string;
  level?: string;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: UserData[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();

        list.push({
          id: docSnap.id,
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          department: data.department ?? '',
          level: data.level ?? '',
          role: data.role ?? 'student',
        });
      });

      setUsers(list);
    });

    return () => unsub();
  }, []);

  // OPEN CONFIRMATION MODAL
  const askChangeRole = (user: UserData, role: string) => {
    setSelectedUser(user);
    setNewRole(role);
    setModalOpen(true);
    setOpenMenu(null);
  };

  // CONFIRM ROLE CHANGE
  const confirmChangeRole = async () => {
    if (!selectedUser) return;

    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        role: newRole,
      });

      // 🔥 instant UI update (no refresh needed)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );

      setModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === 'all' || u.role === filter;

    return matchSearch && matchFilter;
  });

  return (
    <main className="p-6 relative">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="border p-3 rounded w-full"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-3 rounded"
        >
          <option value="all">All</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* USERS */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >

            {/* USER INFO */}
            <div>
              <h2 className="font-semibold">{user.fullName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.department} • {user.level}
              </p>
            </div>

            {/* ROLE */}
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                user.role === 'admin'
                  ? 'bg-red-100 text-red-700'
                  : user.role === 'staff'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {user.role}
            </span>

            {/* 3 DOT MENU */}
            <div className="relative">

              <button
                onClick={() =>
                  setOpenMenu(openMenu === user.id ? null : user.id)
                }
                className="p-2"
              >
                {/* 3-dot icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {openMenu === user.id && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-10">
                  <button
                    onClick={() => askChangeRole(user, 'student')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Make Student
                  </button>

                  <button
                    onClick={() => askChangeRole(user, 'staff')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Make Staff
                  </button>

                  <button
                    onClick={() => askChangeRole(user, 'admin')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Make Admin
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[320px]">

            <h2 className="text-lg font-semibold mb-3">
              Confirm Role Change
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Change <b>{selectedUser.fullName}</b> to <b>{newRole}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmChangeRole}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}