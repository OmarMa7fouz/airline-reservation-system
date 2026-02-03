const express = require('express');
const router = express.Router();
const paymentTransactionController = require('../controllers/paymentTransactionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimitMiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

// All payment transaction routes require authentication

// Create payment transaction - requires authentication
router.post('/', authMiddleware, createLimiter, paymentTransactionController.createPaymentTransaction);

// Get all payment transactions - requires authentication
router.get('/', authMiddleware, paymentTransactionController.getAllPaymentTransactions);

// Get payment transaction by ID - requires authentication
router.get('/:id', authMiddleware, validateIdParam, paymentTransactionController.getPaymentTransactionById);

// Update payment transaction - requires authentication
router.put('/:id', authMiddleware, validateIdParam, paymentTransactionController.updatePaymentTransaction);

// Delete payment transaction - requires authentication
router.delete('/:id', authMiddleware, validateIdParam, paymentTransactionController.deletePaymentTransaction);

module.exports = router;