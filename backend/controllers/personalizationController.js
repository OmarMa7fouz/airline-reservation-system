const db = require('../config/db');

/**
 * Personalization Engine Controller
 * Handles user preferences, recommendations, and personalized offers
 */

// Get or create user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    let preferences = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM user_preferences WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Create default preferences if none exist
    if (!preferences) {
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO user_preferences (user_id) VALUES (?)`,
          [userId],
          function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      preferences = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM user_preferences WHERE id = ?`,
          [result.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user preferences'
    });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      preferred_seat_type,
      preferred_seat_location,
      meal_preference,
      dietary_restrictions,
      preferred_class,
      preferred_airlines,
      preferred_departure_time,
      email_notifications,
      sms_notifications,
      push_notifications,
      wheelchair_assistance,
      special_assistance
    } = req.body;

    const query = `
      UPDATE user_preferences SET
        preferred_seat_type = COALESCE(?, preferred_seat_type),
        preferred_seat_location = COALESCE(?, preferred_seat_location),
        meal_preference = COALESCE(?, meal_preference),
        dietary_restrictions = COALESCE(?, dietary_restrictions),
        preferred_class = COALESCE(?, preferred_class),
        preferred_airlines = COALESCE(?, preferred_airlines),
        preferred_departure_time = COALESCE(?, preferred_departure_time),
        email_notifications = COALESCE(?, email_notifications),
        sms_notifications = COALESCE(?, sms_notifications),
        push_notifications = COALESCE(?, push_notifications),
        wheelchair_assistance = COALESCE(?, wheelchair_assistance),
        special_assistance = COALESCE(?, special_assistance),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    await new Promise((resolve, reject) => {
      db.run(
        query,
        [
          preferred_seat_type, preferred_seat_location, meal_preference,
          dietary_restrictions, preferred_class, preferred_airlines,
          preferred_departure_time, email_notifications, sms_notifications,
          push_notifications, wheelchair_assistance, special_assistance,
          userId
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
};

// Get personalized flight recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's travel history
    const travelHistory = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM user_travel_history 
         WHERE user_id = ? 
         ORDER BY route_frequency DESC, last_traveled DESC 
         LIMIT 5`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Get user preferences
    const preferences = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM user_preferences WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Get available flights matching user's frequent routes
    const recommendations = [];
    for (const route of travelHistory) {
      const flights = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM flights 
           WHERE origin = ? AND destination = ?
           AND departure_time >= datetime('now')
           LIMIT 3`,
          [route.origin, route.destination],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      if (flights.length > 0) {
        recommendations.push({
          route: `${route.origin} → ${route.destination}`,
          frequency: route.frequency,
          lastTraveled: route.last_traveled,
          flights: flights,
          reason: `You've traveled this route ${route.total_bookings} time${route.total_bookings > 1 ? 's' : ''}`
        });
      }
    }

    res.json({
      success: true,
      data: {
        recommendations,
        preferences,
        message: recommendations.length > 0 
          ? `Welcome back! We found ${recommendations.length} recommendation${recommendations.length > 1 ? 's' : ''} based on your travel history.`
          : 'Start booking flights to get personalized recommendations!'
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
};

// Track user travel for recommendations
exports.trackTravel = async (req, res) => {
  try {
    const { userId, origin, destination, departureTime, price } = req.body;

    // Check if route exists in history
    const existing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM user_travel_history WHERE user_id = ? AND origin = ? AND destination = ?`,
        [userId, origin, destination],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      // Update existing route
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE user_travel_history SET
            route_frequency = route_frequency + 1,
            total_bookings = total_bookings + 1,
            last_traveled = ?,
            average_price = (average_price * total_bookings + ?) / (total_bookings + 1),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [new Date().toISOString().split('T')[0], price, existing.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    } else {
      // Create new route history
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO user_travel_history 
          (user_id, origin, destination, preferred_time, average_price, last_traveled, first_traveled)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, origin, destination, departureTime, price,
            new Date().toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({
      success: true,
      message: 'Travel tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking travel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track travel'
    });
  }
};

// Get special occasions
exports.getSpecialOccasions = async (req, res) => {
  try {
    const { userId } = req.params;

    const occasions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM special_occasions WHERE user_id = ? ORDER BY occasion_date ASC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      data: occasions
    });
  } catch (error) {
    console.error('Error fetching occasions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch special occasions'
    });
  }
};

// Add special occasion
exports.addSpecialOccasion = async (req, res) => {
  try {
    const { userId, occasionType, occasionDate, occasionName, reminderDaysBefore } = req.body;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO special_occasions 
        (user_id, occasion_type, occasion_date, occasion_name, reminder_days_before)
        VALUES (?, ?, ?, ?, ?)`,
        [userId, occasionType, occasionDate, occasionName, reminderDaysBefore || 7],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Special occasion added successfully',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Error adding occasion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add special occasion'
    });
  }
};

// Get personalized offers
exports.getPersonalizedOffers = async (req, res) => {
  try {
    const { userId } = req.params;

    const offers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM personalized_offers 
         WHERE user_id = ? 
         AND is_active = 1 
         AND is_used = 0
         AND date('now') BETWEEN valid_from AND valid_until
         ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized offers'
    });
  }
};

// Create personalized offer (admin function)
exports.createPersonalizedOffer = async (req, res) => {
  try {
    const {
      userId,
      offerType,
      offerTitle,
      offerDescription,
      discountPercentage,
      discountAmount,
      validFrom,
      validUntil,
      routeSpecific,
      minPurchaseAmount
    } = req.body;

    // Generate unique promo code
    const promoCode = `SPECIAL${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO personalized_offers 
        (user_id, offer_type, offer_title, offer_description, discount_percentage, 
         discount_amount, promo_code, valid_from, valid_until, route_specific, min_purchase_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, offerType, offerTitle, offerDescription, discountPercentage || 0,
          discountAmount || 0, promoCode, validFrom, validUntil, routeSpecific || null,
          minPurchaseAmount || 0
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, promoCode });
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Personalized offer created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create personalized offer'
    });
  }
};

// Get welcome message
exports.getWelcomeMessage = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get booking count
    const bookingCount = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM tickets WHERE passenger_id IN 
         (SELECT id FROM passengers WHERE user_id = ?)`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Get active offers count
    const offersCount = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM personalized_offers 
         WHERE user_id = ? AND is_active = 1 AND is_used = 0
         AND date('now') BETWEEN valid_from AND valid_until`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Generate personalized message
    let message = `Welcome back, ${user.name || 'Traveler'}! ✈️`;
    
    if (bookingCount.count > 0) {
      message += ` You've made ${bookingCount.count} booking${bookingCount.count > 1 ? 's' : ''} with us.`;
    }

    if (offersCount.count > 0) {
      message += ` You have ${offersCount.count} special offer${offersCount.count > 1 ? 's' : ''} waiting for you!`;
    }

    res.json({
      success: true,
      data: {
        message,
        userName: user.name,
        bookingCount: bookingCount.count,
        activeOffers: offersCount.count
      }
    });
  } catch (error) {
    console.error('Error generating welcome message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate welcome message'
    });
  }
};
