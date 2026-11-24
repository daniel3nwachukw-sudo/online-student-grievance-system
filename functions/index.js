const { setGlobalOptions } = require('firebase-functions/v2');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });
initializeApp();

const db = getFirestore();

async function getManagedCaller(request) {
  const callerId = request.auth && request.auth.uid;
  if (!callerId) {
    throw new HttpsError('unauthenticated', 'Sign in to manage user accounts.');
  }

  const callerSnapshot = await db.collection('users').doc(callerId).get();
  const role = callerSnapshot.exists ? callerSnapshot.data().role : null;
  if (role !== 'staff' && role !== 'admin') {
    throw new HttpsError('permission-denied', 'Staff access is required.');
  }

  return callerId;
}

async function commitOperations(operations) {
  for (let start = 0; start < operations.length; start += 400) {
    const batch = db.batch();
    operations.slice(start, start + 400).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

exports.deleteManagedUser = onCall(async (request) => {
  const callerId = await getManagedCaller(request);
  const userId = request.data && request.data.userId;

  if (typeof userId !== 'string' || !userId.trim()) {
    throw new HttpsError('invalid-argument', 'A user ID is required.');
  }
  if (userId === callerId) {
    throw new HttpsError('failed-precondition', 'You cannot delete your own account here.');
  }

  const userRef = db.collection('users').doc(userId);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) {
    throw new HttpsError('not-found', 'The user profile was not found.');
  }
  if (userSnapshot.data().role === 'admin') {
    throw new HttpsError('failed-precondition', 'Admin accounts cannot be deleted here.');
  }

  try {
    await getAuth().deleteUser(userId);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      console.error('Failed to delete Firebase Auth user:', error);
      throw new HttpsError('internal', 'The user account could not be deleted.');
    }
  }

  const [byReporterId, byStudentId, tokensSnapshot, notificationsSnapshot] =
    await Promise.all([
      db.collection('complaints').where('reporterId', '==', userId).get(),
      db.collection('complaints').where('studentId', '==', userId).get(),
      userRef.collection('fcmTokens').get(),
      db.collection('notifications').where('userId', '==', userId).get(),
    ]);

  const complaints = new Map();
  [...byReporterId.docs, ...byStudentId.docs].forEach((complaint) => {
    complaints.set(complaint.ref.path, complaint.ref);
  });

  const operations = Array.from(complaints.values()).map((complaintRef) => (batch) => {
    batch.update(complaintRef, {
      reporterId: null,
      studentId: null,
      reporterName: FieldValue.delete(),
      fullName: FieldValue.delete(),
      name: FieldValue.delete(),
      email: FieldValue.delete(),
    });
  });

  [...tokensSnapshot.docs, ...notificationsSnapshot.docs].forEach((snapshot) => {
    operations.push((batch) => batch.delete(snapshot.ref));
  });
  operations.push((batch) => batch.delete(userRef));

  await commitOperations(operations);
  return { success: true };
});

async function sendToTokenSnapshots(tokenSnapshots, title, body, url) {
  const tokenDocuments = tokenSnapshots.flatMap((snapshot) =>
    snapshot.docs
      .filter((tokenDocument) => typeof tokenDocument.data().token === 'string')
      .map((tokenDocument) => ({
        token: tokenDocument.data().token,
        ref: tokenDocument.ref,
      }))
  );

  for (let start = 0; start < tokenDocuments.length; start += 500) {
    const group = tokenDocuments.slice(start, start + 500);
    const result = await getMessaging().sendEachForMulticast({
      tokens: group.map((entry) => entry.token),
      notification: { title, body },
      data: { url },
      webpush: {
        notification: { icon: '/icons/icon-192.png' },
      },
    });

    const staleTokenDeletes = [];
    result.responses.forEach((response, index) => {
      const code = response.error && response.error.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        staleTokenDeletes.push(group[index].ref.delete());
      }
    });
    await Promise.all(staleTokenDeletes);
  }
}

async function notifyStaff(title, body, url) {
  const usersSnapshot = await db
    .collection('users')
    .where('role', 'in', ['staff', 'admin'])
    .get();
  const tokenSnapshots = await Promise.all(
    usersSnapshot.docs.map((userDocument) =>
      userDocument.ref.collection('fcmTokens').get()
    )
  );

  await sendToTokenSnapshots(tokenSnapshots, title, body, url);
}

exports.notifyStaffOnNewComplaint = onDocumentCreated(
  'complaints/{complaintId}',
  async (event) => {
    const complaint = event.data && event.data.data();
    if (!complaint) return;

    try {
      await notifyStaff(
        'New student complaint',
        'A new complaint has been submitted. Open the dashboard to review it.',
        `/dashboard/staff/respond/${event.params.complaintId}`
      );
    } catch (error) {
      console.error('Failed to notify staff about a new complaint:', error);
      throw error;
    }
  }
);
