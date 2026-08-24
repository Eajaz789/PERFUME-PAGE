const Coupon = require('../models/Coupon');

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    
    // Validate input
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }
    
    if (!orderValue || orderValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid order value is required'
      });
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }
    
    // Validate coupon
    const validation = coupon.isValid(orderValue);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Calculate discount
    const discount = coupon.calculateDiscount(orderValue);
    
    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount,
        minimumOrderValue: coupon.minimumOrderValue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon'
    });
  }
};
