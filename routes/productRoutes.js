const express = require('express');
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getBestsellerProducts
} = require('../controllers/productController');

const router = express.Router();

// GET all products with filtering
router.get('/', getProducts);

// GET featured products
router.get('/featured', getFeaturedProducts);

// GET bestseller products
router.get('/bestsellers', getBestsellerProducts);

// GET single product by ID
router.get('/:id', getProductById);

module.exports = router;
