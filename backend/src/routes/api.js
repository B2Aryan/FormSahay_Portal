const express = require('express');
const router = express.Router();
const multer = require('multer');

// Services
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const { dbService } = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Multer Upload configuration (10MB limit)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * AUTH: Login / Register user via Firebase token
 * POST /api/auth/login
 * Public — verifies Firebase ID token, creates/updates local user
 */
router.post('/auth/login', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { admin } = require('../config/firebase-admin');
    const { getAuth } = require('firebase-admin/auth');
    const token = authHeader.split('Bearer ')[1];
    const app = admin.getApps()[0];
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(token);

    const { uid, email } = decoded;
    const displayName = decoded.name || (email ? email.split('@')[0] : 'User');
    const { profileData } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email not available from authentication provider' });
    }

    // Find or create user in local DB
    const users = await dbService.getUsers();
    let user = users.find(u => u.email === email);

    if (user) {
      const updates = { name: displayName, updatedAt: new Date().toISOString() };
      if (profileData) {
        if (profileData.state) updates.state = profileData.state;
        if (profileData.age) updates.age = Number(profileData.age);
        if (profileData.category) updates.category = profileData.category;
        if (profileData.income) updates.income = Number(profileData.income);
        if (profileData.education) updates.education = profileData.education;
        if (profileData.gender) updates.gender = profileData.gender;
        if (profileData.disability !== undefined) updates.disability = profileData.disability;
      }
      user = await dbService.updateUser(user._id, updates);
    } else {
      user = await dbService.createUser({
        name: displayName,
        email,
        ...(profileData || {}),
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        state: user.state || '',
        age: user.age || '',
        category: user.category || '',
        income: user.income || '',
        education: user.education || '',
        gender: user.gender || '',
        disability: user.disability || false,
      },
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({ error: 'Authentication failed', message: err.message });
  }
});

/**
 * GET /api/users/me
 * Protected — return current user profile from local DB
 */
router.get('/users/me', authenticate, async (req, res) => {
  try {
    const users = await dbService.getUsers();
    const user = users.find(u => u.email === req.user.email);
    if (!user) return res.status(404).json({ error: 'User profile not found.' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user profile.' });
  }
});

/**
 * GET /api/users/me/applications
 * Protected — return applications for current user
 */
router.get('/users/me/applications', authenticate, async (req, res) => {
  try {
    const users = await dbService.getUsers();
    const user = users.find(u => u.email === req.user.email);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const apps = await dbService.getApplications(user._id);
    return res.status(200).json(apps);
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user applications.' });
  }
});

/**
 * 1. NOTICE ANALYSIS MODULE
 * POST /api/analysis/notice
 * Upload PDF/image of government notice and extract structured parameters using OCR + AI
 */
router.post('/analysis/notice', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file (PDF or image).' });
    }

    console.log(`Processing notice file upload: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // 1. Run OCR (pdf-parse or Tesseract)
    const ocrResult = await ocrService.extractText(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (!ocrResult.success) {
      return res.status(422).json({ 
        error: 'Failed to extract text from the document. Please ensure it is a clear image or selectable text PDF.',
        details: ocrResult.error
      });
    }

    // 2. Query AI distills details
    const analysis = await aiService.analyzeNotice(ocrResult.text);

    return res.status(200).json({
      success: true,
      ocrMethod: ocrResult.method,
      ocrConfidence: ocrResult.confidence,
      analysis
    });
  } catch (err) {
    console.error("Notice analysis endpoint error:", err);
    return res.status(500).json({ error: 'An error occurred during notice processing.', message: err.message });
  }
});

/**
 * 4. AI EXPLANATION ENGINE
 * POST /api/analysis/explanation
 * Explain official complex government jargon in simple plain language
 */
router.post('/analysis/explanation', authenticate, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide official text to explain.' });
  }

  try {
    const explanation = await aiService.explainText(text);
    return res.status(200).json({
      success: true,
      result: explanation
    });
  } catch (err) {
    console.error("Explanation engine endpoint error:", err);
    return res.status(500).json({ error: 'An error occurred during AI explanation.', message: err.message });
  }
});

/**
 * 2. ELIGIBILITY CHECKER MODULE
 * POST /api/eligibility/check
 * Run user profile inputs through scheme parameters and return decision + recommendation list
 */
router.post('/eligibility/check', authenticate, async (req, res) => {
  const { state, age, category, income, education, gender, disability, name, email } = req.body;

  // Real-time validation check
  if (!state || !age || !category || income === undefined || !education || !gender) {
    return res.status(400).json({ error: 'Missing required profile fields (state, age, category, income, education, gender).' });
  }

  try {
    const userData = { state, age: Number(age), category, income: Number(income), education, gender, disability: !!disability };
    
    // Save user profile to database if name & email are present (or create mock user)
    let savedUser = null;
    if (name && email) {
      const users = await dbService.getUsers();
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        savedUser = await dbService.updateUser(existingUser._id, userData);
      } else {
        savedUser = await dbService.createUser({ name, email, ...userData });
      }
    }

    // Fetch all schemes
    const schemes = await dbService.getSchemes({});
    const matches = [];

    // Analyze eligibility for each scheme
    for (const scheme of schemes) {
      const auditResult = await aiService.checkUserEligibility(userData, scheme);
      matches.push({
        schemeId: scheme._id,
        name: scheme.name,
        category: scheme.category,
        benefit: scheme.benefit,
        deadline: scheme.deadline,
        documentsRequired: scheme.documentsRequired,
        contactInfo: scheme.contactInfo,
        instructions: scheme.instructions,
        ...auditResult
      });
    }

    // Sort schemes: eligible first, then matchPercentage desc
    matches.sort((a, b) => {
      const statusWeight = { eligible: 3, partial: 2, not_eligible: 1 };
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[b.status] - statusWeight[a.status];
      }
      return b.matchPercentage - a.matchPercentage;
    });

    // Determine overall status based on best match
    const bestMatch = matches[0];
    const overallStatus = bestMatch ? bestMatch.status : 'not_eligible';
    const overallMatchPercentage = bestMatch ? bestMatch.matchPercentage : 0;
    const overallReasons = bestMatch ? bestMatch.reasons : ['No schemes loaded in database.'];

    return res.status(200).json({
      success: true,
      userId: savedUser ? savedUser._id : null,
      status: overallStatus,
      matchPercentage: overallMatchPercentage,
      reasons: overallReasons,
      schemes: matches
    });
  } catch (err) {
    console.error("Eligibility check endpoint error:", err);
    return res.status(500).json({ error: 'An error occurred during eligibility checks.', message: err.message });
  }
});

/**
 * 3. DOCUMENT VERIFICATION MODULE
 * POST /api/verification/check
 * Upload multiple files and cross reference fields with AI
 */
router.post('/verification/check', authenticate, upload.any(), async (req, res) => {
  try {
    const files = req.files;
    const { documentTypes, userId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one document to verify.' });
    }

    const types = documentTypes ? JSON.parse(documentTypes) : [];
    const results = [];

    console.log(`Verifying ${files.length} documents...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = types[i] || 'AadhaarCard';
      
      // 1. OCR text from document
      const ocrResult = await ocrService.extractText(
        file.buffer,
        file.mimetype,
        file.originalname
      );

      if (!ocrResult.success) {
        results.push({
          type,
          fileName: file.originalname,
          status: 'missing',
          issues: ['Failed to run OCR text extraction. Check scan quality.'],
          action: 'Re-upload document.'
        });
        continue;
      }

      // 2. Validate extracted text via AI
      const verifyReport = await aiService.verifyDocumentText(type, ocrResult.text);
      verifyReport.fileName = file.originalname;
      verifyReport.fileSize = file.size;

      // 3. Save verification details if userId is valid
      if (userId) {
        await dbService.createDocument({
          userId,
          type,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
          status: verifyReport.status,
          verificationDetails: {
            fields: verifyReport.fields,
            validity: verifyReport.validity,
            issues: verifyReport.issues
          }
        });
      }

      results.push(verifyReport);
    }

    return res.status(200).json({
      success: true,
      documents: results
    });
  } catch (err) {
    console.error("Document verification endpoint error:", err);
    return res.status(500).json({ error: 'An error occurred during document verification.', message: err.message });
  }
});

/**
 * 6. SCHEME RECOMMENDATION ENGINE
 * POST /api/recommendations/schemes
 * Returns recommended schemes based on user profile
 */
router.post('/recommendations/schemes', authenticate, async (req, res) => {
  const { state, age, category, income, education } = req.body;

  try {
    const userData = { state, age: Number(age || 21), category: category || 'General', income: Number(income || 0), education: education || 'Graduate' };
    const schemes = await dbService.getSchemes({});
    const recommendations = [];

    for (const scheme of schemes) {
      const result = await aiService.checkUserEligibility(userData, scheme);
      recommendations.push({
        _id: scheme._id,
        name: scheme.name,
        category: scheme.category,
        benefit: scheme.benefit,
        deadline: scheme.deadline,
        documentsRequired: scheme.documentsRequired,
        matchPercentage: result.matchPercentage,
        status: result.status,
        reasons: result.reasons
      });
    }

    // Sort: highest match first
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.status(200).json({
      success: true,
      schemes: recommendations
    });
  } catch (err) {
    console.error("Recommendations endpoint error:", err);
    return res.status(500).json({ error: 'An error occurred loading recommendations.', message: err.message });
  }
});

/**
 * 5. DEADLINE TRACKER & NOTIFICATION LOGGING
 * POST /api/notifications/send
 * Logs notifications triggered by dashboard or EmailJS
 */
router.post('/notifications/send', authenticate, async (req, res) => {
  const { userId, type, title, message, deadline } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ error: 'userId, title, and message are required.' });
  }

  try {
    const notif = await dbService.createNotification({
      userId,
      type: type || 'deadline',
      title,
      message,
      deadline: deadline ? new Date(deadline) : null,
      sent: true,
      sentAt: new Date()
    });

    // Triggers dashboard state save
    if (deadline && userId) {
      // Create or link a application track if matching
      const userApps = await dbService.getApplications(userId);
      const appExists = userApps.some(app => app.deadline.toISOString() === new Date(deadline).toISOString());
      
      if (!appExists) {
        // Create an application tracker entry
        await dbService.createApplication({
          userId,
          schemeId: "000000000000000000000000", // generic linked id
          schemeName: title.replace("Reminder: ", ""),
          progress: "in_progress",
          currentStage: "Reminder Configured",
          deadline: new Date(deadline),
          status: "pending"
        });
      }
    }

    return res.status(200).json({
      success: true,
      notification: notif
    });
  } catch (err) {
    console.error("Notifications endpoint error:", err);
    return res.status(500).json({ error: 'An error occurred logging notification.', message: err.message });
  }
});

/**
 * UTILITY USER PROFILE LOADING
 * GET /api/users/:id
 */
router.get('/users/:id', authenticate, async (req, res) => {
  try {
    const user = await dbService.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User profile not found.' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user profile.' });
  }
});

/**
 * UTILITY APPLICATIONS FETCH
 * GET /api/users/:id/applications
 */
router.get('/users/:id/applications', authenticate, async (req, res) => {
  try {
    const apps = await dbService.getApplications(req.params.id);
    return res.status(200).json(apps);
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user applications.' });
  }
});

module.exports = router;
