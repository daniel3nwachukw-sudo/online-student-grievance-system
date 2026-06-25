'use client';

import { useState } from 'react';
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';

export default function NotificationsPage() {
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!studentName.trim() || !message.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      setSending(true);

      const userQuery = query(
        collection(db, 'users'),
        where('fullName', '==', studentName.trim())
      );

      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        alert('Student not found');
        return;
      }

      const userDoc = userSnapshot.docs[0];

      await addDoc(collection(db, 'notifications'), {
        userId: userDoc.id,
        userName: studentName,
        message,
        read: false,
        createdAt: serverTimestamp(),
      });

      alert('Notification sent successfully');

      setStudentName('');
      setMessage('');
    } catch (error) {
      console.error(error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold mb-6">
          Send Notification
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Student Full Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={sendNotification}
            disabled={sending}
            className="bg-green-600 text-white px-5 py-3 rounded-lg"
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </main>
  );
}