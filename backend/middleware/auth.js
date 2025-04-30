import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  try {
    console.log('Auth Debug:', {
      headers: req.headers,
      cookies: req.cookies,
      token: req.headers.authorization
    });

    // Get token from cookie
    const token = req.cookies.token;
    
    console.log('Auth middleware - token from cookie:', !!token);

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      console.log('Authenticated user:', {
        id: req.user._id.toString(),
        role: req.user.role,
        email: req.user.email
      });
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth Error:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 