const express = require('express');
const { register, login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

const attempts = new Map();
const rateLimitAuth = (req, res, next) => {
	const key = `${req.ip}:${req.path}`;
	const now = Date.now();
	const recent = (attempts.get(key) || []).filter(timestamp => now - timestamp < 15 * 60 * 1000);
	if (recent.length >= 20) return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
	recent.push(now);
	attempts.set(key, recent);
	next();
};

router.post('/register', rateLimitAuth, register);
router.post('/login', rateLimitAuth, login);
router.post('/forgot-password', rateLimitAuth, forgotPassword);
router.post('/reset-password', rateLimitAuth, resetPassword);
router.post('/logout', logout);
router.get('/me', getMe);

module.exports = router;
