const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
        retryAfter: req.rateLimit.resetTime
      }
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 login attempts per 15 minutes per IP
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts from this IP. Please try again later.',
        timestamp: new Date().toISOString(),
        retryAfter: req.rateLimit.resetTime
      }
    });
  }
});

/**
 * Moderate rate limiter for resource creation
 * Limits: 20 creation requests per 15 minutes per IP
 * Prevents spam and abuse
 */
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    error: {
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      message: 'Too many creation requests, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'CREATE_RATE_LIMIT_EXCEEDED',
        message: 'Too many creation requests from this IP. Please slow down.',
        timestamp: new Date().toISOString(),
        retryAfter: req.rateLimit.resetTime
      }
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};
