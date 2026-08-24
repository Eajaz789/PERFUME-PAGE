const Contact = require('../models/Contact');

// @desc    Create new contact submission
// @route   POST /api/contact
// @access  Public
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate all fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }
    
    // Validate phone (basic validation)
    if (phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid phone number is required'
      });
    }
    
    // Create contact submission
    const contact = await Contact.create({ name, email, phone, message });
    
    res.status(201).json({
      success: true,
      message: 'Your message has been received. ÉLORIA will be in touch soon.',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};
