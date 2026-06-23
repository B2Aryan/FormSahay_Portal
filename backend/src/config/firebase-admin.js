const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../../service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized with service account.');
} else {
  console.warn('⚠️  No service-account.json found. Firebase auth middleware will be disabled.');
}

module.exports = { admin };
