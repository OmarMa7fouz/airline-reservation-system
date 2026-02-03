const express = require('express');
const router = express.Router();
const seatAssignmentController = require('../controllers/seatAssignmentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimitMiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

// All seat assignment routes require authentication

// Create seat assignment - requires authentication
router.post('/', authMiddleware, createLimiter, seatAssignmentController.createSeatAssignment);

// Get all seat assignments - requires authentication (can filter by FlightId)
router.get('/', authMiddleware, seatAssignmentController.getAllSeatAssignments);

// Get seat assignment by ID - requires authentication
router.get('/:id', authMiddleware, validateIdParam, seatAssignmentController.getSeatAssignmentById);

// Update seat assignment - requires authentication
router.put('/:id', authMiddleware, validateIdParam, seatAssignmentController.updateSeatAssignment);

// Delete seat assignment - requires authentication
router.delete('/:id', authMiddleware, validateIdParam, seatAssignmentController.deleteSeatAssignment);

module.exports = router;