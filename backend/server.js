require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Startup env-var validation ─────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
  console.error('[STARTUP ERROR] GEMINI_API_KEY is missing from .env – Gemini summarization will be disabled.');
}
if (!process.env.GEMINI_MODEL || !process.env.GEMINI_MODEL.trim()) {
  console.error('[STARTUP ERROR] GEMINI_MODEL is missing from .env – Gemini summarization will be disabled.');
}

// Connect to database
connectDB();

const cookieParser = require('cookie-parser');

const app = express();

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const driveRoutes = require('./routes/driveRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
