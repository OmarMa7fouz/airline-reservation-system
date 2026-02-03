const loyaltyService = require('../services/loyalty/loyalty.service');

/**
 * Get user loyalty points and tier
 */
exports.getUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const account = await loyaltyService.getUserLoyaltyAccount(userId);
    const benefits = loyaltyService.getTierBenefits(account.tier);
    const nextTier = loyaltyService.getPointsToNextTier(account.lifetime_points);

    res.json({
      success: true,
      data: {
        ...account,
        benefits,
        nextTier,
      },
    });
  } catch (error) {
    console.error('Error getting user points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve loyalty points',
    });
  }
};

/**
 * Award points to user
 */
exports.earnPoints = async (req, res) => {
  try {
    const { userId, points, description, ticketId } = req.body;

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        error: 'User ID and points are required',
      });
    }

    const result = await loyaltyService.earnPoints(
      userId,
      points,
      description || 'Points earned',
      ticketId
    );

    res.json(result);
  } catch (error) {
    console.error('Error earning points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award points',
    });
  }
};

/**
 * Redeem points for discount
 */
exports.redeemPoints = async (req, res) => {
  try {
    const { userId, points } = req.body;

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        error: 'User ID and points are required',
      });
    }

    if (points < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum 100 points required for redemption',
      });
    }

    const result = await loyaltyService.redeemPoints(userId, points);
    res.json(result);
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem points',
    });
  }
};

/**
 * Get transaction history
 */
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const history = await loyaltyService.getTransactionHistory(
      userId,
      limit ? parseInt(limit) : 50
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction history',
    });
  }
};

/**
 * Get tier information
 */
exports.getTierInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const account = await loyaltyService.getUserLoyaltyAccount(userId);
    const benefits = loyaltyService.getTierBenefits(account.tier);
    const nextTier = loyaltyService.getPointsToNextTier(account.lifetime_points);

    res.json({
      success: true,
      data: {
        currentTier: account.tier,
        lifetimePoints: account.lifetime_points,
        benefits,
        nextTier,
        allTiers: loyaltyService.constructor.TIERS,
      },
    });
  } catch (error) {
    console.error('Error getting tier info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tier information',
    });
  }
};
