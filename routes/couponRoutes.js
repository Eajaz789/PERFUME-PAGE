const express = require('express');
const { validateCoupon } = require('../controllers/couponController');

const router = express.Router();

// POST validate coupon
router.post('/validate', validateCoupon);

module.exports = router;
