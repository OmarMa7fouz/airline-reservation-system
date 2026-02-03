const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/methods', paymentController.getSavedMethods);
router.post('/methods', paymentController.saveMethod);

module.exports = router;
