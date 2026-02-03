const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Protects routes from unauthorized access
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided',
          timestamp: new Date().toISOString()
        }
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Optional authentication middleware
 * Allows requests to proceed even without authentication
 * but attaches user info if token is present
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };
    }
    
    next();
  } catch (err) {
    // If token is invalid, just continue without user info
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
