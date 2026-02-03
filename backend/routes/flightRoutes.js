const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimitMiddleware');
const { validateCreateFlight, validateIdParam } = require('../middleware/validationMiddleware');

// Public routes (no authentication required)
// Get all flights - public access for searching
router.get('/', optionalAuthMiddleware, flightController.getAllFlights);

// Get flight by ID - public access
router.get('/:id', optionalAuthMiddleware, validateIdParam, flightController.getFlightById);

// Protected routes (authentication required - admin only)
// Create flight - requires authentication
router.post('/', authMiddleware, createLimiter, validateCreateFlight, flightController.createFlight);

// Update flight - requires authentication
router.put('/:id', authMiddleware, validateIdParam, flightController.updateFlight);

// Delete flight - requires authentication
router.delete('/:id', authMiddleware, validateIdParam, flightController.deleteFlight);

module.exports = router;