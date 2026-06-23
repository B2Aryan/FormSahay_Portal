const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../../service-account.json');
let firestore = null;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
  firestore = getFirestore();
  console.log('✅ Firebase Admin initialized with service account + Firestore.');
} else {
  console.warn('⚠️  No service-account.json found. Firebase Admin will be disabled.');
}

module.exports = { admin, firestore };
