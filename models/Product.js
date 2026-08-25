const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    enum: ['woody', 'floral', 'fresh', 'amber', 'oud', 'unisex'],
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    default: 'unisex'
  },
  fragranceFamily: {
    type: String,
    required: true
  },
  topNotes: [{
    type: String
  }],
  heartNotes: [{
    type: String
  }],
  baseNotes: [{
    type: String
  }],
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ category: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
