// !! MUST be first — loads .env before anything else reads process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
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

// CORS — allow local dev + production frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // In dev allow all; restrict in prod by removing this line
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (useful for Render + uptime monitors)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV });
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

// Production — serve React build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'CONNECT GREEN API running in development mode' });
    });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
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

