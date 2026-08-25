const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const auth = require('../middleware/authMiddleware');

// Tax and shipping configuration
const TAX_RATE = 0.18;
const FREE_SHIPPING_LIMIT = 5000;
const SHIPPING_CHARGE = 199;



// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const finishOrder = async () => {};
  const applySession = query => query;
  const sessionOptions = {};
  
  try {
    const { items, customer, shippingAddress, paymentMethod, couponCode, transactionId } = req.body;
    
    // Validate cart
    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }
    
    // Validate customer information
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'All customer fields are required'
      });
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Validate phone (Indian format)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required'
      });
    }
    
    // Validate pincode (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(shippingAddress.pincode)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit pincode'
      });
    }
    
    // Validate payment method
    if (!paymentMethod || !['cod', 'upi', 'card'].includes(paymentMethod)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required'
      });
    }
    
    // For online payment, validate transaction ID
    if (paymentMethod !== 'cod' && !transactionId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required for online payment'
      });
    }
    
    // Fetch current products from database and verify stock
    const orderItems = [];
    let subtotal = 0;
    
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each order item must have a valid quantity'
        });
      }
      const product = await applySession(Product.findById(item.productId));
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product not found`
        });
      }
      
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
        });
      }
      
      // Use current price from database (never trust frontend)
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
      
      // Reduce stock atomically
      const stockUpdate = await Product.updateOne(
        { _id: product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        sessionOptions
      );
      if (stockUpdate.modifiedCount !== 1) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }
    }
    
    // Calculate discount if coupon provided
    let discount = 0;
    let couponData = null;
    
    if (couponCode) {
      const coupon = await applySession(Coupon.findOne({ code: couponCode.toUpperCase() }));
      
      if (!coupon) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Invalid coupon code' });
      }
      const validation = coupon.isValid(subtotal);
      if (!validation.valid) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: validation.message });
      }
      discount = coupon.calculateDiscount(subtotal);
      couponData = { code: coupon.code, discountValue: discount };
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } }, sessionOptions);
    }
    
    // Calculate tax, shipping, and total (server-side calculation)
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * TAX_RATE);
    const shipping = subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_CHARGE;
    const total = taxableAmount + tax + shipping;
    
    // Generate order number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const orderNumber = `ELR-${year}-${random}`;
    
    // Create full shipping address string
    const fullAddress = `${shippingAddress.address}${shippingAddress.landmark ? ', ' + shippingAddress.landmark : ''}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}, ${shippingAddress.country || 'India'}`;
    
    // Create order with authenticated user
    const order = await Order.create([{
      orderNumber,
      user: req.user._id,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: cleanPhone
      },
      shippingAddress: {
        address: shippingAddress.address,
        landmark: shippingAddress.landmark,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India'
      },
      items: orderItems,
      subtotal,
      discount,
      coupon: couponData,
      tax,
      shipping,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      transactionId: transactionId || null,
      orderStatus: 'confirmed'
    }], sessionOptions);

    await finishOrder();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order[0]
    });
  } catch (error) {
    await abortOrder();
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Strict ownership verification: order must belong to user or user must be admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order.'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(error instanceof mongoose.Error.CastError ? 404 : 500).json({
      success: false,
      message: error instanceof mongoose.Error.CastError ? 'Order not found' : 'Failed to fetch order'
    });
  }
};

// @desc    Get current user's orders with status filtering & summary counts
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { status } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.orderStatus = { $in: ['pending', 'confirmed', 'processing', 'shipped'] };
      } else if (status === 'delivered') {
        query.orderStatus = 'delivered';
      } else if (status === 'cancelled') {
        query.orderStatus = 'cancelled';
      }
    }

    const [orders, total, totalOrders, completedOrders, pendingOrders] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
      Order.countDocuments({ user: req.user._id }),
      Order.countDocuments({ user: req.user._id, orderStatus: 'delivered' }),
      Order.countDocuments({ user: req.user._id, orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } })
    ]);

    res.json({
      success: true,
      data: orders,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

