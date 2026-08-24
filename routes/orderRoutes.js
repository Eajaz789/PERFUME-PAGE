const express = require('express');
const {
  createOrder,
  getOrderById,
  getMyOrders
} = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// POST create new order (protected)
router.post('/', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);

// GET order by ID (protected)
router.get('/:id', auth, getOrderById);

module.exports = router;
