const db = require('../config/db');

/**
 * Multi-Modal Travel Controller
 * Handles package deals and multi-modal bookings (Flight + Hotel + Car)
 */

// Get all travel packages
exports.getAllPackages = async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, featured } = req.query;

    let query = `SELECT * FROM travel_packages WHERE is_active = 1`;
    const params = [];

    if (destination) {
      query += ` AND destination LIKE ?`;
      params.push(`%${destination}%`);
    }

    if (minPrice) {
      query += ` AND final_price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ` AND final_price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    if (featured === 'true') {
      query += ` AND featured = 1`;
    }

    query += ` ORDER BY featured DESC, final_price ASC`;

    const packages = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel packages'
    });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const { packageId } = req.params;

    const packageData = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM travel_packages WHERE id = ? AND is_active = 1`,
        [packageId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }

    // Get package components
    const components = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM package_components WHERE package_id = ?`,
        [packageId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      data: {
        ...packageData,
        components
      }
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch package details'
    });
  }
};

// Create a multi-modal booking
exports.createMultiModalBooking = async (req, res) => {
  try {
    const {
      userId,
      packageId,
      flightId,
      hotelName,
      hotelCheckIn,
      hotelCheckOut,
      hotelRoomType,
      hotelPrice,
      carType,
      carPickupDate,
      carReturnDate,
      carPrice,
      totalPrice,
      discountApplied
    } = req.body;

    // Validation
    if (!userId || !totalPrice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Generate unique booking reference
    const bookingReference = `MM${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const finalPrice = totalPrice - (discountApplied || 0);

    const query = `
      INSERT INTO multi_modal_bookings (
        user_id, package_id, booking_reference,
        flight_id, hotel_name, hotel_check_in, hotel_check_out,
        hotel_room_type, hotel_price, car_type, car_pickup_date,
        car_return_date, car_price, total_price, discount_applied,
        final_price, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'completed')
    `;

    const result = await new Promise((resolve, reject) => {
      db.run(
        query,
        [
          userId, packageId || null, bookingReference,
          flightId || null, hotelName, hotelCheckIn, hotelCheckOut,
          hotelRoomType, hotelPrice || 0, carType || null, carPickupDate || null,
          carReturnDate || null, carPrice || 0, totalPrice, discountApplied || 0,
          finalPrice
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Multi-modal booking created successfully',
      data: {
        bookingId: result.id,
        bookingReference,
        finalPrice
      }
    });
  } catch (error) {
    console.error('Error creating multi-modal booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
};

// Get user's multi-modal bookings
exports.getUserMultiModalBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        mmb.*,
        tp.name as package_name,
        tp.destination as package_destination,
        tp.image_url,
        f.DepartureTime as flight_date,
        f.FlightNumber,
        f.Source as flight_source,
        f.Destination as flight_destination
      FROM multi_modal_bookings mmb
      LEFT JOIN travel_packages tp ON mmb.package_id = tp.id
      LEFT JOIN flights f ON mmb.flight_id = f.id
      WHERE mmb.user_id = ?
      ORDER BY mmb.created_at DESC
    `;

    const bookings = await new Promise((resolve, reject) => {
      db.all(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching multi-modal bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
};

// Get booking by reference
exports.getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const query = `
      SELECT 
        mmb.*,
        tp.name as package_name,
        tp.description as package_description,
        tp.destination,
        tp.image_url,
        f.flight_number,
        f.departure_time,
        f.arrival_time
      FROM multi_modal_bookings mmb
      LEFT JOIN travel_packages tp ON mmb.package_id = tp.id
      LEFT JOIN flights f ON mmb.flight_id = f.id
      WHERE mmb.booking_reference = ?
    `;

    const booking = await new Promise((resolve, reject) => {
      db.get(query, [reference], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking details'
    });
  }
};

// Cancel multi-modal booking
exports.cancelMultiModalBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE multi_modal_bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [bookingId],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
};

// Get package statistics
exports.getPackageStats = async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total_packages,
          COUNT(CASE WHEN featured = 1 THEN 1 END) as featured_packages,
          AVG(final_price) as avg_price,
          MIN(final_price) as min_price,
          MAX(final_price) as max_price
        FROM travel_packages
        WHERE is_active = 1`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const bookingStats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
          SUM(final_price) as total_revenue
        FROM multi_modal_bookings`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      success: true,
      data: {
        packages: stats,
        bookings: bookingStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};
