const db = require('../config/db');

/**
 * Price Alert Controller
 * Handles price drop alerts for flight tracking
 */

// Create a new price alert
exports.createPriceAlert = async (req, res) => {
  try {
    const { userId, origin, destination, departureDate, returnDate, maxPrice, email } = req.body;

    // Validation
    if (!userId || !origin || !destination || !departureDate || !maxPrice || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const query = `
      INSERT INTO price_alerts (user_id, origin, destination, departure_date, return_date, max_price, email, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const result = await new Promise((resolve, reject) => {
      db.run(
        query,
        [userId, origin, destination, departureDate, returnDate || null, maxPrice, email],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Price alert created successfully',
      data: {
        alertId: result.id,
        origin,
        destination,
        maxPrice
      }
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create price alert'
    });
  }
};

// Get all price alerts for a user
exports.getUserPriceAlerts = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        id,
        origin,
        destination,
        departure_date,
        return_date,
        max_price,
        current_price,
        email,
        is_active,
        created_at,
        last_checked
      FROM price_alerts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const alerts = await new Promise((resolve, reject) => {
      db.all(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price alerts'
    });
  }
};

// Delete a price alert
exports.deletePriceAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const query = `DELETE FROM price_alerts WHERE id = ?`;

    await new Promise((resolve, reject) => {
      db.run(query, [alertId], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: 'Price alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete price alert'
    });
  }
};

// Toggle price alert active status
exports.togglePriceAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { isActive } = req.body;

    const query = `UPDATE price_alerts SET is_active = ? WHERE id = ?`;

    await new Promise((resolve, reject) => {
      db.run(query, [isActive ? 1 : 0, alertId], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: `Price alert ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle price alert'
    });
  }
};

// Get price history for a route
exports.getPriceHistory = async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    const query = `
      SELECT 
        price,
        checked_at as date
      FROM price_history
      WHERE origin = ? AND destination = ? AND departure_date = ?
      ORDER BY checked_at DESC
      LIMIT 30
    `;

    const history = await new Promise((resolve, reject) => {
      db.all(query, [origin, destination, departureDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history'
    });
  }
};

// Check prices and send notifications (background job)
exports.checkPricesAndNotify = async () => {
  try {
    // Get all active price alerts
    const query = `SELECT * FROM price_alerts WHERE is_active = 1`;

    const alerts = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const alert of alerts) {
      // Simulate price checking (in production, this would call a real flight API)
      const currentPrice = await simulateGetCurrentPrice(alert.origin, alert.destination, alert.departure_date);

      // Update current price
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE price_alerts SET current_price = ?, last_checked = CURRENT_TIMESTAMP WHERE id = ?`,
          [currentPrice, alert.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Record price history
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO price_history (origin, destination, departure_date, price, checked_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [alert.origin, alert.destination, alert.departure_date, currentPrice],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Check if price dropped below max price
      if (currentPrice <= alert.max_price) {
        console.log(`🔔 Price alert triggered for ${alert.origin} → ${alert.destination}: $${currentPrice}`);
        // In production, send email notification here
        // await sendEmailNotification(alert.email, alert, currentPrice);
      }
    }

    console.log(`✅ Checked ${alerts.length} price alerts`);
  } catch (error) {
    console.error('Error checking prices:', error);
  }
};

// Simulate getting current price (replace with real API in production)
async function simulateGetCurrentPrice(origin, destination, date) {
  // Generate a random price between $200 and $800
  return Math.floor(Math.random() * 600) + 200;
}

module.exports = exports;
