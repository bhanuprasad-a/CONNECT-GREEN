const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role: requestedRole } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Allow specific demo emails to have different roles
        const DEMO_ACCOUNTS = {
            'admin@connectgreen.com': 'admin',
            'business@connectgreen.com': 'business',
            'sitemanager@connectgreen.com': 'siteManager',
            'tourist@connectgreen.com': 'tourist'
        };

        // only the designated admin email is allowed to become admin
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aryathebasha@outlook.com';
        let role = 'tourist'; // default role
        
        // Check if it's a demo account
        if (DEMO_ACCOUNTS[email]) {
            role = DEMO_ACCOUNTS[email];
        } else if (email === ADMIN_EMAIL) {
            role = 'admin';
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt: ${email}`);

        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log(`Login successful: ${email} with role: ${user.role}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                greenPoints: user.greenPoints || 0,
                token: generateToken(user._id)
            });
        } else {
            console.log(`Login failed: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            greenPoints: user.greenPoints || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };
