const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      
      // Attach user to req object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
         return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Token expired' });
      }
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ code: 'TOKEN_INVALID', message: 'Not authorized, no token' });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this route' });
    }
    next();
  };
};

module.exports = { protect, authorize };
