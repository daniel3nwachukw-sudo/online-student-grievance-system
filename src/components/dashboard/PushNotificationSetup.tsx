'use client';

import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { app, auth, db } from '@/src/lib/firebase';

export default function PushNotificationSetup() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return () => {
        active = false;
      };
    }

    isSupported()
      .then((supported) => {
        if (!active || !supported) return;

        unsubscribe = onMessage(getMessaging(app), (payload) => {
          if (!payload.notification) return;

          const notification = new Notification(
            payload.notification.title || 'Grievance System',
            {
              body: payload.notification.body || 'There is an update to a grievance.',
              icon: '/icons/icon-192.png',
            }
          );
          notification.onclick = () => {
            const path = payload.data?.url || '/';
            window.focus();
            window.location.assign(path);
            notification.close();
          };
        });
      })
      .catch((error) => {
        console.error('Unable to listen for foreground push notifications:', error);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function enableNotifications() {
    setMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage('Sign in before enabling notifications.');
        return;
      }

      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setMessage('This browser does not support push notifications.');
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        setMessage('Push notifications are not configured for this deployment.');
        return;
      }

      setLoading(true);
      if (!(await isSupported())) {
        setMessage('Push notifications are not supported on this device or browser.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('Notification permission was not granted. Allow notifications in your browser settings to enable them.');
        return;
      }

      const serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      const token = await getToken(getMessaging(app), {
        vapidKey,
        serviceWorkerRegistration,
      });

      if (!token) {
        setMessage('Could not register this device for notifications. Please try again.');
        return;
      }

      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const tokenId = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

      await setDoc(doc(db, 'users', user.uid, 'fcmTokens', tokenId), {
        token,
        updatedAt: serverTimestamp(),
      });

      setEnabled(true);
      setMessage('Phone notifications are enabled on this device.');
    } catch (error) {
      console.error('Unable to enable push notifications:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to enable push notifications.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading || enabled}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
      >
        <BellRing size={16} />
        {loading ? 'Enabling...' : enabled ? 'Notifications enabled' : 'Enable phone notifications'}
      </button>
      {message ? (
        <p aria-live="polite" className="max-w-64 text-right text-xs text-slate-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}
