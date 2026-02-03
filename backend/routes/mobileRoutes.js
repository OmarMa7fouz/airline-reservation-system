const express = require('express');
const router = express.Router();
const mobileController = require('../controllers/mobileController');

// Wallet Passes
router.get('/wallet/apple/:ticketId', mobileController.getApplePass);
router.get('/wallet/google/:ticketId', mobileController.getGooglePass);

// Push Notifications
router.post('/push/subscribe', mobileController.subscribeToPush);

// Mobile Deals
router.get('/deals', mobileController.getMobileDeals);

module.exports = router;
