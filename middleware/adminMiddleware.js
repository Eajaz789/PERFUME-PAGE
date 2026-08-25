// Middleware to verify if authenticated user has admin role
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Access denied. Administrator privileges required.'
  });
};

module.exports = adminAuth;
