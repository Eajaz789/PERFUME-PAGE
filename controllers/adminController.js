const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Subscriber = require('../models/Subscriber');
const Contact = require('../models/Contact');

// In-memory store settings with MongoDB persistence support
const storeSettings = {
  storeName: 'ÉLORIA Luxury Parfums',
  tagline: 'A Fragrance That Becomes Your Signature.',
  contactEmail: 'concierge@eloria.com',
  supportPhone: '+91 98765 43210',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 18,
  freeShippingLimit: 5000,
  shippingCharge: 199
};

// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================

// @desc    Get dashboard metrics, sales charts, and recent orders
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Start of Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of This Week (Monday)
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Start of This Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel counts and aggregations
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      pendingOrders,
      salesAggregation,
      todaySalesAgg,
      weekSalesAgg,
      monthSalesAgg,
      recentOrders,
      lowStockList,
      salesTimelineAgg
    ] = await Promise.all([
      // Total Orders
      Order.countDocuments(),
      
      // Total Products
      Product.countDocuments(),
      
      // Total Customers
      User.countDocuments({ role: 'customer' }),
      
      // Low Stock Count (<= 3)
      Product.countDocuments({ stock: { $lte: 3 } }),
      
      // Pending/Processing Orders Count
      Order.countDocuments({ orderStatus: { $in: ['pending', 'processing', 'confirmed'] } }),
      
      // Lifetime Total Sales (excluding cancelled)
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: { $ifNull: ['$total', 0] } }, avgOrderValue: { $avg: { $ifNull: ['$total', 0] } }, count: { $sum: 1 } } }
      ]),
      
      // Today Sales
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } }, count: { $sum: 1 }, avgOrderValue: { $avg: { $ifNull: ['$total', 0] } } } }
      ]),
      
      // This Week Sales
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } }, count: { $sum: 1 }, avgOrderValue: { $avg: { $ifNull: ['$total', 0] } } } }
      ]),
      
      // This Month Sales
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } }, count: { $sum: 1 }, avgOrderValue: { $avg: { $ifNull: ['$total', 0] } } } }
      ]),
      
      // Recent 8 Orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber customer total paymentMethod paymentStatus orderStatus createdAt items'),
      
      // Low Stock Products list (<= 5 items)
      Product.find({ stock: { $lte: 5 } })
        .sort({ stock: 1 })
        .limit(6)
        .select('name image stock price category'),

      // Sales Timeline (Last 7 Days)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const lifetimeStats = salesAggregation[0] || { totalRevenue: 0, avgOrderValue: 0, count: 0 };
    const todayStats = todaySalesAgg[0] || { revenue: 0, count: 0, avgOrderValue: 0 };
    const weekStats = weekSalesAgg[0] || { revenue: 0, count: 0, avgOrderValue: 0 };
    const monthStats = monthSalesAgg[0] || { revenue: 0, count: 0, avgOrderValue: 0 };

    res.json({
      success: true,
      data: {
        cards: {
          totalSales: lifetimeStats.totalRevenue || 0,
          totalOrders: totalOrders || 0,
          totalProducts: totalProducts || 0,
          totalCustomers: totalCustomers || 0,
          lowStock: lowStockProducts || 0,
          pendingOrders: pendingOrders || 0
        },
        salesOverview: {
          today: {
            revenue: todayStats.revenue || 0,
            orders: todayStats.count || 0,
            avgOrderValue: Math.round(todayStats.avgOrderValue || 0)
          },
          week: {
            revenue: weekStats.revenue || 0,
            orders: weekStats.count || 0,
            avgOrderValue: Math.round(weekStats.avgOrderValue || 0)
          },
          month: {
            revenue: monthStats.revenue || 0,
            orders: monthStats.count || 0,
            avgOrderValue: Math.round(monthStats.avgOrderValue || 0)
          },
          lifetime: {
            revenue: lifetimeStats.totalRevenue || 0,
            orders: lifetimeStats.count || 0,
            avgOrderValue: Math.round(lifetimeStats.avgOrderValue || 0)
          }
        },
        chartData: salesTimelineAgg || [],
        recentOrders: recentOrders || [],
        lowStockList: lowStockList || []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// ==========================================
// 2. PRODUCTS MANAGEMENT
// ==========================================

// @desc    Get paginated products with search and category filters
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    
    const { search, category, stockStatus, sortBy, sortOrder } = req.query;
    
    const query = {};
    
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { sku: searchRegex },
        { fragranceFamily: searchRegex }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (stockStatus) {
      if (stockStatus === 'outOfStock') query.stock = 0;
      else if (stockStatus === 'lowStock') query.stock = { $gt: 0, $lte: 3 };
      else if (stockStatus === 'inStock') query.stock = { $gt: 3 };
    }

    const sortOptions = {};
    const sortField = sortBy || 'createdAt';
    const direction = sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortField] = direction;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/admin/products/:id
// @access  Private (Admin)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, slug, sku, description, shortDescription,
      price, originalPrice, category, gender, fragranceFamily,
      topNotes, heartNotes, baseNotes, image, images,
      stock, rating, featured, bestSeller, newArrival
    } = req.body;

    // Required fields validation
    if (!name || !description || !shortDescription || price === undefined || !category || !fragranceFamily || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, short description, price, category, fragrance family, and image are required.'
      });
    }

    const numPrice = Number(price);
    const numStock = stock !== undefined ? Number(stock) : 10;
    const numRating = rating !== undefined ? Number(rating) : 5.0;

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number.' });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be a non-negative integer.' });
    }

    if (isNaN(numRating) || numRating < 0 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5.' });
    }

    // Auto-generate slug if not provided or format existing
    let generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existingProduct = await Product.findOne({ slug: generatedSlug });
    if (existingProduct) {
      generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Parse note arrays if string
    const parseNotes = (notes) => {
      if (Array.isArray(notes)) return notes;
      if (typeof notes === 'string') return notes.split(',').map(n => n.trim()).filter(Boolean);
      return [];
    };

    const newProduct = await Product.create({
      name: name.trim(),
      slug: generatedSlug,
      sku: sku ? sku.trim().toUpperCase() : `ELR-${Date.now().toString().slice(-6)}`,
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      price: numPrice,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      gender: gender || 'unisex',
      fragranceFamily: fragranceFamily.trim(),
      topNotes: parseNotes(topNotes),
      heartNotes: parseNotes(heartNotes),
      baseNotes: parseNotes(baseNotes),
      image: image.trim(),
      images: Array.isArray(images) && images.length ? images : [image.trim()],
      stock: Math.floor(numStock),
      rating: numRating,
      featured: Boolean(featured),
      bestSeller: Boolean(bestSeller),
      newArrival: Boolean(newArrival),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name, slug, sku, description, shortDescription,
      price, originalPrice, category, gender, fragranceFamily,
      topNotes, heartNotes, baseNotes, image, images,
      stock, rating, featured, bestSeller, newArrival
    } = req.body;

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }

    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    const parseNotes = (notes) => {
      if (Array.isArray(notes)) return notes;
      if (typeof notes === 'string') return notes.split(',').map(n => n.trim()).filter(Boolean);
      return [];
    };

    if (name) product.name = name.trim();
    if (slug) product.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (sku !== undefined) product.sku = sku ? sku.trim().toUpperCase() : product.sku;
    if (description) product.description = description.trim();
    if (shortDescription) product.shortDescription = shortDescription.trim();
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = originalPrice ? Number(originalPrice) : undefined;
    if (category) product.category = category;
    if (gender) product.gender = gender;
    if (fragranceFamily) product.fragranceFamily = fragranceFamily.trim();
    if (topNotes !== undefined) product.topNotes = parseNotes(topNotes);
    if (heartNotes !== undefined) product.heartNotes = parseNotes(heartNotes);
    if (baseNotes !== undefined) product.baseNotes = parseNotes(baseNotes);
    if (image) product.image = image.trim();
    if (images) product.images = Array.isArray(images) ? images : [image || product.image];
    if (stock !== undefined) product.stock = Math.floor(Number(stock));
    if (rating !== undefined) product.rating = Math.max(0, Math.min(5, Number(rating)));
    if (featured !== undefined) product.featured = Boolean(featured);
    if (bestSeller !== undefined) product.bestSeller = Boolean(bestSeller);
    if (newArrival !== undefined) product.newArrival = Boolean(newArrival);
    
    product.updatedAt = new Date();

    const updated = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Fragrance removed successfully from collection.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// @desc    Quick stock update
// @route   PATCH /api/admin/products/:id/stock
// @access  Private (Admin)
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be 0 or greater.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Math.floor(numStock), updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: `Stock updated for ${product.name}`,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
};

// ==========================================
// 3. ORDERS MANAGEMENT
// ==========================================

// @desc    Get paginated orders with filters
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    
    const { search, orderStatus, paymentStatus } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex }
      ];
    }

    if (orderStatus && orderStatus !== 'all') {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// @desc    Update order status and/or payment status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const validOrderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    const updateFields = { updatedAt: new Date() };

    if (orderStatus) {
      if (!validOrderStatuses.includes(orderStatus.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid order status' });
      }
      updateFields.orderStatus = orderStatus.toLowerCase();
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid payment status' });
      }
      updateFields.paymentStatus = paymentStatus.toLowerCase();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: `Order status updated to ${order.orderStatus}`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// ==========================================
// 4. CUSTOMERS MANAGEMENT
// ==========================================

// @desc    Get customers with aggregated order statistics
// @route   GET /api/admin/customers
// @access  Private (Admin)
exports.getCustomers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    
    const { search } = req.query;
    const matchStage = { role: 'customer' };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchStage.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const [customers, totalResult] = await Promise.all([
      User.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'user',
            as: 'orders'
          }
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            role: 1,
            createdAt: 1,
            orderCount: { $size: '$orders' },
            totalSpent: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'o',
                      cond: { $ne: ['$$o.orderStatus', 'cancelled'] }
                    }
                  },
                  as: 'validOrder',
                  in: '$$validOrder.total'
                }
              }
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      User.countDocuments(matchStage)
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total: totalResult,
        pages: Math.ceil(totalResult / limit) || 1
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

// @desc    Get customer details and their order history
// @route   GET /api/admin/customers/:id
// @access  Private (Admin)
exports.getCustomerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    const totalSpent = orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      data: {
        customer: user,
        orderCount: orders.length,
        totalSpent,
        orders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer details' });
  }
};

// ==========================================
// 5. COUPONS MANAGEMENT
// ==========================================

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code, discountType, discountValue, minimumOrderValue,
      maximumDiscount, expiryDate, usageLimit, active
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount type, discount value, and expiry date are required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderValue: minimumOrderValue ? Number(minimumOrderValue) : 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      active: active !== undefined ? Boolean(active) : true,
      usedCount: 0
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const {
      code, discountType, discountValue, minimumOrderValue,
      maximumDiscount, expiryDate, usageLimit, active
    } = req.body;

    if (code) coupon.code = code.trim().toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumOrderValue !== undefined) coupon.minimumOrderValue = Number(minimumOrderValue);
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount ? Number(maximumDiscount) : null;
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (active !== undefined) coupon.active = Boolean(active);

    const updated = await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update coupon' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

// ==========================================
// 6. SUBSCRIBERS MANAGEMENT
// ==========================================

// @desc    Get subscribers
// @route   GET /api/admin/subscribers
// @access  Private (Admin)
exports.getSubscribers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    
    const { search } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.email = new RegExp(search.trim(), 'i');
    }

    const [subscribers, total] = await Promise.all([
      Subscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Subscriber.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
  }
};

// @desc    Delete subscriber
// @route   DELETE /api/admin/subscribers/:id
// @access  Private (Admin)
exports.deleteSubscriber = async (req, res) => {
  try {
    const sub = await Subscriber.findByIdAndDelete(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    res.json({ success: true, message: 'Subscriber removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete subscriber' });
  }
};

// ==========================================
// 7. CONTACT MESSAGES MANAGEMENT
// ==========================================

// @desc    Get contact messages
// @route   GET /api/admin/messages
// @access  Private (Admin)
exports.getMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    
    const { search, isRead } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { message: searchRegex }
      ];
    }

    if (isRead !== undefined && isRead !== 'all') {
      query.isRead = isRead === 'true';
    }

    const [messages, total, unreadCount] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(query),
      Contact.countDocuments({ isRead: false })
    ]);

    res.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// @desc    Toggle message read status
// @route   PUT /api/admin/messages/:id/read
// @access  Private (Admin)
exports.markMessageRead = async (req, res) => {
  try {
    const { isRead } = req.body;
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: isRead !== undefined ? Boolean(isRead) : true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: message.isRead ? 'Marked as read' : 'Marked as unread',
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
};

// @desc    Delete message
// @route   DELETE /api/admin/messages/:id
// @access  Private (Admin)
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Contact.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

// ==========================================
// 8. STORE SETTINGS
// ==========================================

// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
exports.getSettings = async (req, res) => {
  try {
    res.json({ success: true, data: storeSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const {
      storeName, tagline, contactEmail, supportPhone,
      taxRate, freeShippingLimit, shippingCharge
    } = req.body;

    if (storeName) storeSettings.storeName = storeName.trim();
    if (tagline) storeSettings.tagline = tagline.trim();
    if (contactEmail) storeSettings.contactEmail = contactEmail.trim();
    if (supportPhone) storeSettings.supportPhone = supportPhone.trim();
    if (taxRate !== undefined) storeSettings.taxRate = Number(taxRate);
    if (freeShippingLimit !== undefined) storeSettings.freeShippingLimit = Number(freeShippingLimit);
    if (shippingCharge !== undefined) storeSettings.shippingCharge = Number(shippingCharge);

    res.json({
      success: true,
      message: 'Store settings updated successfully',
      data: storeSettings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};
