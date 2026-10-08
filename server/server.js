// !! MUST be first — loads .env before anything else reads process.env
require('dotenv').config();

const { loadSecurityConfig } = require('./config/security');
const { allowedOrigins } = loadSecurityConfig();

const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const tripRoutes = require('./routes/tripRoutes');
const siteRoutes = require('./routes/siteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recyclingRoutes = require('./routes/recyclingRoutes');
const siteManagerRoutes = require('./routes/siteManagerRoutes');
const offsetRoutes = require('./routes/offsetRoutes');

// Connect to Database
connectDB();

const app = express();

// Security Headers (disables powered-by, protects against common web vulnerabilities)
app.use(helmet({
    contentSecurityPolicy: false, // Allows external map tiles (MapLibre / OpenStreetMap) and assets
    crossOriginEmbedderPolicy: false
}));

// Gzip / Brotli compression for all JSON and static payloads (cuts latency by 70-85%)
app.use(compression());

// Log request duration after the response completes; headers are already committed at this point.
app.use((req, res, next) => {
    const start = process.hrtime();
    res.once('finish', () => {
        const diff = process.hrtime(start);
        const timeMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2);
        console.info(JSON.stringify({
            level: 'info',
            event: 'http_response',
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: Number(timeMs),
        }));
    });
    next();
});

// API Rate Limiting to prevent latency spikes from DDoS / brute force
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again in 15 minutes.' }
});

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/site-manager', authLimiter);

// Serve uploaded images with caching (1 day)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true
}));

// Health check endpoint (useful for Render + uptime monitors)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recycling', recyclingRoutes);
app.use('/api/site-requests', siteManagerRoutes);
app.use('/api/offsets', offsetRoutes);

// Production — serve React build with cache headers
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist'), {
        maxAge: '1d',
        etag: true
    }));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'CONNECT GREEN API running in development mode' });
    });
}

// Global error handler (avoids stack leak in production)
app.use((err, req, res, next) => {
    console.error(JSON.stringify({ level: 'error', operation: 'http.middleware', errorName: err?.name || 'UnknownError' }));
    res.status(err.status || 500).json({ message: 'An internal error occurred.' });
});

// Export app for Vercel
module.exports = app;

const PORT = process.env.PORT || 5000;

// Only listen if not being imported as a module (e.g. by Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🌿 CONNECT GREEN Server running on port ${PORT}`);
        console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   MongoDB: ${process.env.MONGO_URI ? 'URI loaded ✓' : '⚠️ MONGO_URI missing!'}`);
    });
}

