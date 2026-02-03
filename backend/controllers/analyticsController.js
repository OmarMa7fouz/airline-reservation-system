const db = require('../config/database');

// Get booking analytics overview
const getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    // Total bookings
    const totalBookingsQuery = `
      SELECT COUNT(*) as total 
      FROM tickets 
      ${startDate && endDate ? 'WHERE booking_time BETWEEN ? AND ?' : ''}
    `;
    const totalBookings = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.get(totalBookingsQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      });
    });

    // Total revenue
    const totalRevenueQuery = `
      SELECT SUM(amount) as revenue 
      FROM PaymentTransaction 
      WHERE status = 'completed'
      ${startDate && endDate ? 'AND payment_time BETWEEN ? AND ?' : ''}
    `;
    const totalRevenue = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.get(totalRevenueQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.revenue || 0);
      });
    });

    // Average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Bookings by period
    const periodGroup = period === 'daily' ? "date(booking_time)" :
                       period === 'weekly' ? "strftime('%Y-W%W', booking_time)" :
                       "strftime('%Y-%m', booking_time)";

    const bookingsTrendQuery = `
      SELECT ${periodGroup} as period, 
             COUNT(*) as bookings,
             SUM(CASE WHEN t.ticket_id IS NOT NULL THEN 
               (SELECT amount FROM PaymentTransaction WHERE ticket_id = t.ticket_id LIMIT 1) 
             ELSE 0 END) as revenue
      FROM tickets t
      ${startDate && endDate ? 'WHERE booking_time BETWEEN ? AND ?' : ''}
      GROUP BY period
      ORDER BY period DESC
      LIMIT 30
    `;

    const bookingsTrend = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.all(bookingsTrendQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Top routes
    const topRoutesQuery = `
      SELECT f.origin, f.destination, 
             COUNT(*) as bookings,
             SUM(CASE WHEN pt.amount IS NOT NULL THEN pt.amount ELSE f.price END) as revenue
      FROM tickets t
      JOIN flights f ON t.flight_id = f.flight_id
      LEFT JOIN PaymentTransaction pt ON t.ticket_id = pt.ticket_id AND pt.status = 'completed'
      ${startDate && endDate ? 'WHERE t.booking_time BETWEEN ? AND ?' : ''}
      GROUP BY f.origin, f.destination
      ORDER BY bookings DESC
      LIMIT 10
    `;

    const topRoutes = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.all(topRoutesQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgBookingValue: parseFloat(avgBookingValue.toFixed(2)),
        },
        bookingsTrend: bookingsTrend.reverse(),
        topRoutes
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Total customers
    const totalCustomersQuery = `
      SELECT COUNT(DISTINCT passenger_id) as total 
      FROM tickets
      ${startDate && endDate ? 'WHERE booking_time BETWEEN ? AND ?' : ''}
    `;
    const totalCustomers = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.get(totalCustomersQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      });
    });

    // Repeat customers
    const repeatCustomersQuery = `
      SELECT COUNT(*) as repeat_customers
      FROM (
        SELECT passenger_id, COUNT(*) as booking_count
        FROM tickets
        ${startDate && endDate ? 'WHERE booking_time BETWEEN ? AND ?' : ''}
        GROUP BY passenger_id
        HAVING booking_count > 1
      )
    `;
    const repeatCustomers = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.get(repeatCustomersQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.repeat_customers || 0);
      });
    });

    // Customer segmentation by booking frequency
    const segmentationQuery = `
      SELECT 
        CASE 
          WHEN booking_count = 1 THEN 'One-time'
          WHEN booking_count BETWEEN 2 AND 5 THEN 'Regular'
          ELSE 'Frequent'
        END as segment,
        COUNT(*) as customers,
        SUM(total_spent) as revenue
      FROM (
        SELECT 
          p.passenger_id,
          COUNT(t.ticket_id) as booking_count,
          COALESCE(SUM(pt.amount), 0) as total_spent
        FROM passengers p
        LEFT JOIN tickets t ON p.passenger_id = t.passenger_id
        LEFT JOIN PaymentTransaction pt ON t.ticket_id = pt.ticket_id AND pt.status = 'completed'
        ${startDate && endDate ? 'WHERE t.booking_time BETWEEN ? AND ?' : ''}
        GROUP BY p.passenger_id
      )
      GROUP BY segment
    `;

    const customerSegments = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.all(segmentationQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        repeatCustomers,
        retentionRate: totalCustomers > 0 ? 
          parseFloat(((repeatCustomers / totalCustomers) * 100).toFixed(2)) : 0,
        segments: customerSegments
      }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer analytics' });
  }
};

// Get route profitability analysis
const getRouteProfitability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const profitabilityQuery = `
      SELECT 
        f.origin,
        f.destination,
        COUNT(DISTINCT f.flight_id) as total_flights,
        COUNT(t.ticket_id) as total_bookings,
        CAST(COUNT(t.ticket_id) AS FLOAT) / COUNT(DISTINCT f.flight_id) as avg_bookings_per_flight,
        SUM(CASE WHEN pt.status = 'completed' THEN pt.amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN pt.status = 'completed' THEN pt.amount ELSE 0 END) as avg_ticket_price,
        (SELECT COUNT(*) FROM seatAssignments sa 
         WHERE sa.flight_id IN (SELECT flight_id FROM flights WHERE origin = f.origin AND destination = f.destination)) 
         as seats_sold
      FROM flights f
      LEFT JOIN tickets t ON f.flight_id = t.flight_id
      LEFT JOIN PaymentTransaction pt ON t.ticket_id = pt.ticket_id
      ${startDate && endDate ? 'WHERE f.departure_time BETWEEN ? AND ?' : ''}
      GROUP BY f.origin, f.destination
      ORDER BY total_revenue DESC
    `;

    const routeProfitability = await new Promise((resolve, reject) => {
      const params = startDate && endDate ? [startDate, endDate] : [];
      db.all(profitabilityQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: routeProfitability
    });

  } catch (error) {
    console.error('Route profitability error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch route profitability' });
  }
};

// Get conversion funnel analytics
const getConversionFunnel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // This is a simplified version - in production, you'd track these events
    const params = startDate && endDate ? [startDate, endDate] : [];
    
    // Flight searches (we'll estimate from flights viewed)
    const flightSearchesQuery = `
      SELECT COUNT(DISTINCT flight_id) as searches
      FROM flights
      ${startDate && endDate ? 'WHERE departure_time BETWEEN ? AND ?' : ''}
    `;

    const searches = await new Promise((resolve, reject) => {
      db.get(flightSearchesQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.searches || 0);
      });
    });

    // Tickets created
    const ticketsQuery = `
      SELECT COUNT(*) as tickets
      FROM tickets
      ${startDate && endDate ? 'WHERE booking_time BETWEEN ? AND ?' : ''}
    `;

    const tickets = await new Promise((resolve, reject) => {
      db.get(ticketsQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.tickets || 0);
      });
    });

    // Completed payments
    const paymentsQuery = `
      SELECT COUNT(*) as payments
      FROM PaymentTransaction
      WHERE status = 'completed'
      ${startDate && endDate ? 'AND payment_time BETWEEN ? AND ?' : ''}
    `;

    const payments = await new Promise((resolve, reject) => {
      db.get(paymentsQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.payments || 0);
      });
    });

    const funnel = [
      { stage: 'Flight Search', count: searches, percentage: 100 },
      { stage: 'Flight Selected', count: tickets, percentage: searches > 0 ? (tickets / searches * 100).toFixed(2) : 0 },
      { stage: 'Payment Completed', count: payments, percentage: searches > 0 ? (payments / searches * 100).toFixed(2) : 0 }
    ];

    res.json({
      success: true,
      data: {
        funnel,
        overallConversionRate: searches > 0 ? parseFloat((payments / searches * 100).toFixed(2)) : 0
      }
    });

  } catch (error) {
    console.error('Conversion funnel error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversion funnel' });
  }
};

// Get real-time metrics
const getRealTimeMetrics = async (req, res) => {
  try {
    // Last 24 hours metrics
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Today's bookings
    const todayBookingsQuery = `
      SELECT COUNT(*) as bookings, SUM(
        (SELECT amount FROM PaymentTransaction WHERE ticket_id = t.ticket_id LIMIT 1)
      ) as revenue
      FROM tickets t
      WHERE booking_time >= ?
    `;

    const todayMetrics = await new Promise((resolve, reject) => {
      db.get(todayBookingsQuery, [last24Hours], (err, row) => {
        if (err) reject(err);
        else resolve(row || { bookings: 0, revenue: 0 });
      });
    });

    // Active users (bookings in last hour)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT passenger_id) as active_users
      FROM tickets
      WHERE booking_time >= ?
    `;

    const activeUsers = await new Promise((resolve, reject) => {
      db.get(activeUsersQuery, [lastHour], (err, row) => {
        if (err) reject(err);
        else resolve(row?.active_users || 0);
      });
    });

    // Pending payments
    const pendingPaymentsQuery = `
      SELECT COUNT(*) as pending
      FROM PaymentTransaction
      WHERE status = 'pending'
    `;

    const pendingPayments = await new Promise((resolve, reject) => {
      db.get(pendingPaymentsQuery, [], (err, row) => {
        if (err) reject(err);
        else resolve(row?.pending || 0);
      });
    });

    res.json({
      success: true,
      data: {
        todayBookings: todayMetrics.bookings || 0,
        todayRevenue: parseFloat((todayMetrics.revenue || 0).toFixed(2)),
        activeUsers,
        pendingPayments,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Real-time metrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch real-time metrics' });
  }
};

// Export data for reporting
const exportAnalytics = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let query, params = [];

    switch (type) {
      case 'bookings':
        query = `
          SELECT 
            t.ticket_id,
            t.booking_time,
            p.first_name || ' ' || p.last_name as passenger_name,
            p.email,
            f.origin,
            f.destination,
            f.departure_time,
            pt.amount,
            pt.status
          FROM tickets t
          JOIN passengers p ON t.passenger_id = p.passenger_id
          JOIN flights f ON t.flight_id = f.flight_id
          LEFT JOIN PaymentTransaction pt ON t.ticket_id = pt.ticket_id
          ${startDate && endDate ? 'WHERE t.booking_time BETWEEN ? AND ?' : ''}
          ORDER BY t.booking_time DESC
        `;
        params = startDate && endDate ? [startDate, endDate] : [];
        break;

      case 'revenue':
        query = `
          SELECT 
            date(payment_time) as date,
            COUNT(*) as transactions,
            SUM(amount) as total_revenue,
            AVG(amount) as avg_transaction
          FROM PaymentTransaction
          WHERE status = 'completed'
          ${startDate && endDate ? 'AND payment_time BETWEEN ? AND ?' : ''}
          GROUP BY date(payment_time)
          ORDER BY date DESC
        `;
        params = startDate && endDate ? [startDate, endDate] : [];
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid export type' });
    }

    const data = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to export analytics' });
  }
};

module.exports = {
  getBookingAnalytics,
  getCustomerAnalytics,
  getRouteProfitability,
  getConversionFunnel,
  getRealTimeMetrics,
  exportAnalytics
};
