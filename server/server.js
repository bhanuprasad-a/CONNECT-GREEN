const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const tripRoutes = require('./routes/tripRoutes');
const siteRoutes = require('./routes/siteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recyclingRoutes = require('./routes/recyclingRoutes');

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recycling', recyclingRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('CONNECT GREEN API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
