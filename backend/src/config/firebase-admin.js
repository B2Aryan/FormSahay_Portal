const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

let firestore = null;

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
    firestore = getFirestore();
    console.log('✅ Firebase Admin initialized with env var + Firestore.');
  } catch (err) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
  }
} else {
  console.warn('⚠️  No FIREBASE_SERVICE_ACCOUNT_KEY found. Firebase Admin will be disabled.');
}

module.exports = { admin, firestore };
