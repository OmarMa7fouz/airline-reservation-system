const express = require('express');
const router = express.Router();
const priceAlertController = require('../controllers/priceAlertController');

// Create a new price alert
router.post('/alerts', priceAlertController.createPriceAlert);

// Get all price alerts for a user
router.get('/alerts/user/:userId', priceAlertController.getUserPriceAlerts);

// Delete a price alert
router.delete('/alerts/:alertId', priceAlertController.deletePriceAlert);

// Toggle price alert active status
router.patch('/alerts/:alertId/toggle', priceAlertController.togglePriceAlert);

// Get price history for a route
router.get('/history', priceAlertController.getPriceHistory);

module.exports = router;
