import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes and verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    // Check if token is missing or doesn't start with "Bearer"
    if (!authHeader || !authHeader.startsWith('JWT ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token by removing "Bearer " prefix
    const token = authHeader.substring(7);

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If user not found, return unauthorized
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Attach user object to request so next middleware can use it
    req.user = user;

    // Proceed to next middleware or route
    next();
  } catch (error) {
    // Handle specific JWT errors
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    // For any other error, return server error
    res.status(500).json({ message: 'Server error' });
  }
};

// Alternative names for the same middleware
export const authenticateToken = authMiddleware;

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('JWT ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    req.user = user || null;
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default authMiddleware;
