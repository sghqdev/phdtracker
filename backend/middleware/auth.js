import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  try {
    console.log('\n=== Auth Middleware Debug ===');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies || 'No cookies found');
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);

    // Get token from cookie or Authorization header
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header');
    }
    
    if (!token) {
      console.log('No token found in cookies or Authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', {
        userId: decoded.userId,
        iat: decoded.iat,
        exp: decoded.exp
      });
      
      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        console.log('User not found for token');
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
      console.error('Token verification error:', {
        message: error.message,
        stack: error.stack,
        token: token.substring(0, 20) + '...' // Log first 20 chars of token for debugging
      });
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