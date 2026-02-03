const express = require('express');
const router = express.Router();
const multiModalController = require('../controllers/multiModalController');

// Package routes
router.get('/packages', multiModalController.getAllPackages);
router.get('/packages/:packageId', multiModalController.getPackageById);
router.get('/packages/stats', multiModalController.getPackageStats);

// Booking routes
router.post('/bookings', multiModalController.createMultiModalBooking);
router.get('/bookings/user/:userId', multiModalController.getUserMultiModalBookings);
router.get('/bookings/reference/:reference', multiModalController.getBookingByReference);
router.delete('/bookings/:bookingId', multiModalController.cancelMultiModalBooking);

module.exports = router;
