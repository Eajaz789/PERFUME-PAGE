const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

const {
  getDashboardStats,
  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  // Orders
  getOrders,
  getOrderById,
  updateOrderStatus,
  // Customers
  getCustomers,
  getCustomerById,
  // Coupons
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  // Subscribers
  getSubscribers,
  deleteSubscriber,
  // Messages
  getMessages,
  markMessageRead,
  deleteMessage,
  // Settings
  getSettings,
  updateSettings
} = require('../controllers/adminController');

// Apply auth and adminAuth to all admin API routes
router.use(auth, adminAuth);

// 1. Dashboard
router.get('/dashboard', getDashboardStats);

// 2. Products
router.get('/products', getProducts);
router.post('/products', createProduct);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateStock);

// 3. Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// 4. Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);

// 5. Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// 6. Subscribers
router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);

// 7. Messages
router.get('/messages', getMessages);
router.put('/messages/:id/read', markMessageRead);
router.delete('/messages/:id', deleteMessage);

// 8. Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
