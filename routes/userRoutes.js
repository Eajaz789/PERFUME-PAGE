const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  changePassword
} = require('../controllers/userController');

// All user routes are protected with auth middleware
router.use(auth);

// Profile
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Password
router.put('/change-password', changePassword);

module.exports = router;
