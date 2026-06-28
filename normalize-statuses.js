const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const normalizeStatus = (value) => {
  const s = String(value ?? '').trim().toLowerCase();

  if (['pending', 'new', 'open'].includes(s)) return 'Pending';
  if (['in progress', 'progress', 'working', 'ongoing'].includes(s)) return 'In Progress';
  if (['resolved', 'done', 'closed', 'complete', 'completed'].includes(s)) return 'Resolved';
  if (['rejected', 'reject', 'declined', 'denied'].includes(s)) return 'Rejected';

  return 'Pending';
};

async function run() {
  const snap = await db.collection('complaints').get();
  const batch = db.batch();

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const current = data.status;
    const normalized = normalizeStatus(current);

    if (current !== normalized) {
      batch.update(docSnap.ref, { status: normalized });
    }
  });

  await batch.commit();
  console.log('Statuses normalized successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error normalizing statuses:', err);
  process.exit(1);
});