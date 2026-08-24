const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const safeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || ''
});

const setAuthCookie = (res, token) => res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eloria_secret_key_2024', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, terms } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    
    // Validation
    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    if ((confirmPassword && password !== confirmPassword) || (terms && terms !== 'on')) {
      return res.status(400).json({
        success: false,
        message: password !== confirmPassword ? 'Passwords do not match' : 'Please accept the Terms & Conditions'
      });
    }
    
    if (!emailPattern.test(normalizedEmail) || !passwordPattern.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Use a valid email and a password with 8 characters, uppercase, lowercase, and a number'
      });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone: phone ? String(phone).replace(/\D/g, '') : undefined,
      password
    });
    
    // Generate token
    setAuthCookie(res, generateToken(user._id));
    
    res.status(201).json({
      success: true,
      message: 'Your ÉLORIA account has been created',
      user: safeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    
    // Validation
    if (!emailPattern.test(normalizedEmail) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set HTTP-only cookie
    setAuthCookie(res, token);
    
    res.json({
      success: true,
      message: 'Welcome back to ÉLORIA',
      user: safeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({
      success: true,
      message: 'You have been signed out'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Public
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eloria_secret_key_2024');
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      res.json({
        success: true,
        authenticated: true,
        user: safeUser(user)
      });
    } else {
      res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }
  } catch (error) {
    res.json({
      success: true,
      authenticated: false,
      user: null
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  const response = { success: true, message: 'If an account exists, password reset instructions have been sent.' };
  try {
    if (emailPattern.test(normalizedEmail)) {
      const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordToken +resetPasswordExpire');
      if (user) {
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        if (process.env.NODE_ENV !== 'production') response.resetToken = resetToken;
      }
    }
    res.json(response);
  } catch (error) {
    res.json(response);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !passwordPattern.test(password || '') || password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide a valid password and matching confirmation.' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully. Please sign in again.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to reset password.' });
  }
};
