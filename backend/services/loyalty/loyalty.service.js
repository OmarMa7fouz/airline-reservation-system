const db = require('../../config/db');

/**
 * Loyalty Program Service
 * Handles points earning, redemption, and tier management
 */
class LoyaltyService {
  /**
   * Tier thresholds
   */
  static TIERS = {
    SILVER: { min: 0, max: 999, name: 'Silver', benefits: ['Standard baggage', 'Email support'] },
    GOLD: { min: 1000, max: 4999, name: 'Gold', benefits: ['Extra 10kg baggage', 'Priority check-in', 'Lounge access (select airports)'] },
    PLATINUM: { min: 5000, max: Infinity, name: 'Platinum', benefits: ['Extra 20kg baggage', 'Priority boarding', 'Lounge access (all airports)', 'Complimentary upgrades'] },
  };

  /**
   * Get or create loyalty account for user
   */
  getUserLoyaltyAccount(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM loyalty_points WHERE user_id = ?';
      
      db.get(query, [userId], (err, row) => {
        if (err) {
          return reject(err);
        }

        if (row) {
          return resolve(row);
        }

        // Create new account if doesn't exist
        const insertQuery = 'INSERT INTO loyalty_points (user_id, points, tier, lifetime_points) VALUES (?, 0, ?, 0)';
        db.run(insertQuery, [userId, 'Silver'], function(err) {
          if (err) {
            return reject(err);
          }

          resolve({
            id: this.lastID,
            user_id: userId,
            points: 0,
            tier: 'Silver',
            lifetime_points: 0,
          });
        });
      });
    });
  }

  /**
   * Calculate tier based on lifetime points
   */
  calculateTier(lifetimePoints) {
    if (lifetimePoints >= LoyaltyService.TIERS.PLATINUM.min) {
      return 'Platinum';
    } else if (lifetimePoints >= LoyaltyService.TIERS.GOLD.min) {
      return 'Gold';
    }
    return 'Silver';
  }

  /**
   * Award points to user (e.g., after booking)
   */
  async earnPoints(userId, points, description, ticketId = null) {
    try {
      const account = await this.getUserLoyaltyAccount(userId);
      const newPoints = account.points + points;
      const newLifetimePoints = account.lifetime_points + points;
      const newTier = this.calculateTier(newLifetimePoints);

      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Update loyalty account
          const updateQuery = `
            UPDATE loyalty_points 
            SET points = ?, lifetime_points = ?, tier = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
          `;
          
          db.run(updateQuery, [newPoints, newLifetimePoints, newTier, userId], (err) => {
            if (err) {
              return reject(err);
            }

            // Record transaction
            const transactionQuery = `
              INSERT INTO loyalty_transactions (user_id, points, type, description, ticket_id) 
              VALUES (?, ?, 'EARN', ?, ?)
            `;
            
            db.run(transactionQuery, [userId, points, description, ticketId], (err) => {
              if (err) {
                return reject(err);
              }

              resolve({
                success: true,
                points: newPoints,
                pointsEarned: points,
                tier: newTier,
                lifetimePoints: newLifetimePoints,
              });
            });
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Redeem points for discount
   */
  async redeemPoints(userId, pointsToRedeem) {
    try {
      const account = await this.getUserLoyaltyAccount(userId);

      if (account.points < pointsToRedeem) {
        return {
          success: false,
          error: 'Insufficient points',
        };
      }

      const newPoints = account.points - pointsToRedeem;
      const discountAmount = pointsToRedeem / 100; // 100 points = $1

      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Update loyalty account
          const updateQuery = `
            UPDATE loyalty_points 
            SET points = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
          `;
          
          db.run(updateQuery, [newPoints, userId], (err) => {
            if (err) {
              return reject(err);
            }

            // Record transaction
            const transactionQuery = `
              INSERT INTO loyalty_transactions (user_id, points, type, description) 
              VALUES (?, ?, 'REDEEM', ?)
            `;
            
            const description = `Redeemed ${pointsToRedeem} points for $${discountAmount.toFixed(2)} discount`;
            
            db.run(transactionQuery, [userId, -pointsToRedeem, description], (err) => {
              if (err) {
                return reject(err);
              }

              resolve({
                success: true,
                pointsRedeemed: pointsToRedeem,
                discountAmount,
                remainingPoints: newPoints,
              });
            });
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM loyalty_transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      db.all(query, [userId, limit], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  /**
   * Get tier benefits
   */
  getTierBenefits(tier) {
    const tierData = Object.values(LoyaltyService.TIERS).find(t => t.name === tier);
    return tierData ? tierData.benefits : [];
  }

  /**
   * Get points needed for next tier
   */
  getPointsToNextTier(lifetimePoints) {
    if (lifetimePoints < LoyaltyService.TIERS.GOLD.min) {
      return {
        nextTier: 'Gold',
        pointsNeeded: LoyaltyService.TIERS.GOLD.min - lifetimePoints,
      };
    } else if (lifetimePoints < LoyaltyService.TIERS.PLATINUM.min) {
      return {
        nextTier: 'Platinum',
        pointsNeeded: LoyaltyService.TIERS.PLATINUM.min - lifetimePoints,
      };
    }
    return {
      nextTier: null,
      pointsNeeded: 0,
    };
  }
}

module.exports = new LoyaltyService();
