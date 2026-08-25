require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const contactRoutes = require('./routes/contactRoutes');
const couponRoutes = require('./routes/couponRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to ensure default admin user exists
async function ensureAdminUser() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const existingUser = await User.findOne({ email: 'admin@eloria.com' });
      if (existingUser) {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('Default admin role granted to admin@eloria.com');
      } else {
        await User.create({
          firstName: 'Éloria',
          lastName: 'Admin',
          email: 'admin@eloria.com',
          phone: '9876543210',
          password: 'AdminPassword123',
          role: 'admin',
          isVerified: true
        });
        console.log('Default admin user created: admin@eloria.com / AdminPassword123');
      }
    }
  } catch (err) {
    console.error('Error ensuring admin user:', err.message);
  }
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_ORIGIN,
      'https://perfume-page-s1q6.vercel.app',
      'http://localhost:5001',
      'http://localhost:5000',
      'http://localhost:3000'
    ].filter(Boolean);
    if (allowed.some(o => origin.startsWith(o)) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now (restrict later)
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('ÉLORIA database connected');
    await ensureAdminUser();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Admin portal route
app.get(['/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;

// Only listen when not running on Vercel (Vercel manages its own server)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ÉLORIA server running on port ${PORT}`);
  });
}
