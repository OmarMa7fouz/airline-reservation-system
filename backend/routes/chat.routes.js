const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat endpoints
router.post('/message', chatController.sendMessage);
router.get('/history/:userId', chatController.getHistory);
router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);
router.get('/suggestions', chatController.getSuggestions);
router.post('/feedback', chatController.submitFeedback);

module.exports = router;
