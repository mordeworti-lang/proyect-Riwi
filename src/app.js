'use strict';

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const errorMiddleware        = require('./middleware/errorMiddleware');
const authRoutes             = require('./routes/authRoutes');
const couderRoutes           = require('./routes/couderRoutes');
const interventionRoutes     = require('./routes/interventionRoutes');
const aiAnalysisRoutes       = require('./routes/aiAnalysisRoutes');
const dashboardRoutes        = require('./routes/dashboardRoutes');
const InterventionController = require('./controllers/interventionController');
const MigrationController    = require('./controllers/migrationController');
const authMiddleware         = require('./middleware/authMiddleware');
const { FRONTEND_URL }       = require('./config/env');

const app = express();

// ── Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com', 'cdn.jsdelivr.net'],
            styleSrc:   ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com', 'fonts.googleapis.com'],
            fontSrc:    ["'self'", 'fonts.gstatic.com'],
            connectSrc: ["'self'", 'https://api.openai.com'],
        }
    }
}));

// ── CORS
app.use(cors({
    origin: FRONTEND_URL === '*' ? true : FRONTEND_URL,
    credentials: true,
}));

// ── Rate limiting — general API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Rate limiting — auth routes (stricter: 10 attempts per 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Too many login attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);

// ── Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API routes
app.use('/api/auth',       authRoutes);
app.use('/api/couders',    couderRoutes);
app.use('/api/dashboard',  dashboardRoutes);

// Nested: /api/couders/:couderId/interventions
app.use('/api/couders/:couderId/interventions', interventionRoutes);

// Nested: /api/couders/:couderId/ai-analysis
app.use('/api/couders/:couderId/ai-analysis', aiAnalysisRoutes);

// Standalone intervention update/delete
app.put('/api/interventions/:id',    authMiddleware, InterventionController.update);
app.delete('/api/interventions/:id', authMiddleware, InterventionController.remove);

// ── Health check
app.get('/health', (req, res) => res.json({ ok: true, timestamp: new Date() }));

// ── Auto migration endpoints (no auth required for setup)
app.post('/api/admin/migrate-testing-data', MigrationController.runMigration);
app.get('/api/admin/verify-migration', MigrationController.verifyMigration);

// ── SPA fallback (all non-API GET routes serve index.html)
app.get(/^(?!\/api).*$/, (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
