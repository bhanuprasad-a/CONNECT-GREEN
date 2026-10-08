const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, createSiteManagerUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/site-manager', protect, authorize('admin'), createSiteManagerUser);
router.get('/me', protect, getMe);

module.exports = router;
