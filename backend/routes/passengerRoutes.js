const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authLimiter, createLimiter } = require('../middleware/rateLimitMiddleware');
const { 
  validateRegistration, 
  validateLogin,
  validateIdParam 
} = require('../middleware/validationMiddleware');

// Public routes (no authentication required)
// Register a new passenger - with strict rate limiting and validation
router.post('/register', authLimiter, createLimiter, validateRegistration, passengerController.registerPassenger);

// Login - with strict rate limiting and validation
router.post('/login', authLimiter, validateLogin, passengerController.loginPassenger);

// Protected routes (authentication required)
// Get all passengers - admin only (for now, just requires auth)
router.get('/', authMiddleware, passengerController.getAllPassengers);

// Get passenger by ID - requires authentication
router.get('/:id', authMiddleware, validateIdParam, passengerController.getPassengerById);

// Update passenger - requires authentication
router.put('/:id', authMiddleware, validateIdParam, passengerController.updatePassenger);

// Delete passenger - requires authentication
router.delete('/:id', authMiddleware, validateIdParam, passengerController.deletePassenger);

module.exports = router;