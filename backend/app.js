require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const passengerRoutes = require('./routes/passengerRoutes');
const flightRoutes = require('./routes/flightRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const seatAssignmentRoutes = require('./routes/seatAssignmentRoutes');
const paymentTransactionRoutes = require('./routes/paymentTransactionRoutes');
const chatRoutes = require('./routes/chat.routes');
// const analyticsRoutes = require('./routes/analyticsRoutes'); // Temporarily disabled - has dependency issues
const loyaltyRoutes = require('./routes/loyalty.routes');
const priceAlertRoutes = require('./routes/priceAlertRoutes');
const multiModalRoutes = require('./routes/multiModalRoutes');
const personalizationRoutes = require('./routes/personalizationRoutes');
const mobileRoutes = require('./routes/mobileRoutes');
const communityRoutes = require('./routes/communityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

// Middleware
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"], // Allow images from https (e.g. Unsplash)
      connectSrc: ["'self'", "http://localhost:3000"], // Allow frontend connection
    },
  },
}));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting
app.use(apiLimiter);

// API v1 Routes
app.use('/api/v1/passengers', passengerRoutes);
app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/seatAssignments', seatAssignmentRoutes);
app.use('/api/v1/paymentTransactions', paymentTransactionRoutes);
app.use('/api/v1/chat', chatRoutes);
// app.use('/api/v1/analytics', analyticsRoutes); // Temporarily disabled
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/price-alerts', priceAlertRoutes);
app.use('/api/v1/multi-modal', multiModalRoutes);
app.use('/api/v1/personalization', personalizationRoutes);
app.use('/api/v1/mobile', mobileRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Backward compatibility - redirect old routes to v1
app.use('/api/passengers', passengerRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/seatAssignments', seatAssignmentRoutes);
app.use('/api/paymentTransactions', paymentTransactionRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api/analytics', analyticsRoutes); // Temporarily disabled
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/multi-modal', multiModalRoutes);
app.use('/api/personalization', personalizationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📚 API v1 available at http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});