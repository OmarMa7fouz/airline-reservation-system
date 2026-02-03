const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimitMiddleware');
const { validateCreateTicket, validateIdParam } = require('../middleware/validationMiddleware');

// All ticket routes require authentication

// Create ticket - requires authentication
router.post('/', authMiddleware, createLimiter, validateCreateTicket, ticketController.createTicket);

// Get all tickets - requires authentication
router.get('/', authMiddleware, ticketController.getAllTickets);

// Get ticket by ID - requires authentication
router.get('/:id', authMiddleware, validateIdParam, ticketController.getTicketById);

// Update ticket - requires authentication
router.put('/:id', authMiddleware, validateIdParam, ticketController.updateTicket);

// Cancel ticket - requires authentication
router.delete('/:id', authMiddleware, validateIdParam, ticketController.cancelTicket);

module.exports = router;