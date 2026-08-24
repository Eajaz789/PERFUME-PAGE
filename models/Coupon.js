const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    default: null
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function(orderValue) {
  const now = new Date();
  
  // Check if coupon is active
  if (!this.active) {
    return { valid: false, message: 'This coupon is inactive.' };
  }
  
  // Check if expired
  if (this.expiryDate < now) {
    return { valid: false, message: 'This coupon has expired.' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit.' };
  }
  
  // Check minimum order value
  if (orderValue < this.minimumOrderValue) {
    return { valid: false, message: `Minimum order value is ₹${this.minimumOrderValue.toLocaleString()}.` };
  }
  
  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderValue) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = orderValue * (this.discountValue / 100);
  } else {
    discount = this.discountValue;
  }
  
  // Apply maximum discount cap if set
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }
  
  return Math.round(discount);
};

module.exports = mongoose.model('Coupon', couponSchema);
