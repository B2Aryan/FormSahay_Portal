const { admin } = require('../config/firebase-admin');
const { getAuth } = require('firebase-admin/auth');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const app = admin.getApps()[0];
    if (!app) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
  }
};

module.exports = { authenticate };
