const Subscriber = require('../models/Subscriber');

// @desc    Create new subscriber
// @route   POST /api/subscribers
// @access  Public
exports.createSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }
    
    // Check for existing subscriber
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }
    
    // Create subscriber
    const subscriber = await Subscriber.create({ email });
    
    res.status(201).json({
      success: true,
      message: 'Welcome to the world of ÉLORIA.',
      data: subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe'
    });
  }
};
