require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedSchemes } = require('./services/seedService');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development / production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if any
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register API routes
app.use('/api', apiRoutes);

// Base route for sanity check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: "Welcome to the AI Government Form Assistant API server.",
    status: "healthy",
    mode: require('./config/db').dbService.isFallback() ? "JSON_Fallback" : "MongoDB"
  });
});

// Start server
const startServer = async () => {
  // 1. Connect to Database (MongoDB or local JSON Fallback)
  await connectDB();
  
  // 2. Seed database with real-world Indian government schemes
  await seedSchemes();

  // 3. Bind port
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
};

startServer().catch(err => {
  console.error("❌ Failed to launch backend server:", err);
});
