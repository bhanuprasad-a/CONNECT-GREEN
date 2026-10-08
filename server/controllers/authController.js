const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getRegistrationRole } = require('../utils/registrationRole');
const { respondWithApiError } = require('../utils/apiError');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role: requestedRole } = req.body;
        if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 120 ||
            typeof email !== 'string' || email.trim().length > 254 ||
            typeof password !== 'string' || password.length < 12 || password.length > 128) {
            return res.status(400).json({ message: 'Provide a valid name, email, and password of at least 12 characters' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const role = getRegistrationRole(requestedRole);
        if (!role) {
            return res.status(400).json({ message: 'This account role requires approval or administrator provisioning' });
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
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
        respondWithApiError(res, error, 'auth.register');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                greenPoints: user.greenPoints || 0,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        respondWithApiError(res, error, 'auth.login');
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            greenPoints: user.greenPoints || 0
        });
    } catch (error) {
        respondWithApiError(res, error, 'auth.profile');
    }
};

const createSiteManagerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 120 ||
            typeof email !== 'string' || email.trim().length > 254 ||
            typeof password !== 'string' || password.length < 12 || password.length > 128) {
            return res.status(400).json({ message: 'Provide a valid name, email, and password of at least 12 characters' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (await User.exists({ email: normalizedEmail })) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            role: 'siteManager',
        });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        respondWithApiError(res, error, 'auth.createSiteManager');
    }
};

module.exports = { registerUser, loginUser, getMe, createSiteManagerUser };
