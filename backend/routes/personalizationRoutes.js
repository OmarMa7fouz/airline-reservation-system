const express = require('express');
const router = express.Router();
const personalizationController = require('../controllers/personalizationController');

// User Preferences
router.get('/preferences/:userId', personalizationController.getUserPreferences);
router.put('/preferences/:userId', personalizationController.updateUserPreferences);

// Recommendations
router.get('/recommendations/:userId', personalizationController.getRecommendations);
router.post('/track-travel', personalizationController.trackTravel);

// Special Occasions
router.get('/occasions/:userId', personalizationController.getSpecialOccasions);
router.post('/occasions', personalizationController.addSpecialOccasion);

// Personalized Offers
router.get('/offers/:userId', personalizationController.getPersonalizedOffers);
router.post('/offers', personalizationController.createPersonalizedOffer);

// Welcome Message
router.get('/welcome/:userId', personalizationController.getWelcomeMessage);

module.exports = router;
