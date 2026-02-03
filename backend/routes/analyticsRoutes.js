const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get booking analytics
router.get('/bookings', analyticsController.getBookingAnalytics);

// Get customer analytics
router.get('/customers', analyticsController.getCustomerAnalytics);

// Get route profitability
router.get('/routes/profitability', analyticsController.getRouteProfitability);

// Get conversion funnel
router.get('/funnel', analyticsController.getConversionFunnel);

// Get real-time metrics
router.get('/realtime', analyticsController.getRealTimeMetrics);

// Export analytics data
router.get('/export', analyticsController.exportAnalytics);

module.exports = router;
