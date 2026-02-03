const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');

/**
 * Loyalty Program Routes
 */

// Get user loyalty points and tier
router.get('/points/:userId', loyaltyController.getUserPoints);

// Award points to user
router.post('/earn', loyaltyController.earnPoints);

// Redeem points for discount
router.post('/redeem', loyaltyController.redeemPoints);

// Get transaction history
router.get('/history/:userId', loyaltyController.getHistory);

// Get tier information
router.get('/tier/:userId', loyaltyController.getTierInfo);

module.exports = router;
