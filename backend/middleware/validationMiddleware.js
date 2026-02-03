const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach(error => {
      if (!fieldErrors[error.path]) {
        fieldErrors[error.path] = error.msg;
      }
    });

    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: new Date().toISOString(),
        fields: fieldErrors
      }
    });
  }
  
  next();
};

/**
 * Validation rules for passenger registration
 */
const validateRegistration = [
  body('Username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('Email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('Password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('FirstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('LastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('SSN')
    .optional()
    .trim()
    .isLength({ min: 9, max: 11 })
    .withMessage('SSN must be between 9 and 11 characters'),
  
  body('DateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  
  body('Gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('City')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  
  body('State')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  
  body('PhoneNumber')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number must contain only digits, spaces, and valid phone characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for passenger login
 */
const validateLogin = [
  body('Username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('Password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for creating a flight
 */
const validateCreateFlight = [
  body('FlightNumber')
    .trim()
    .matches(/^[A-Z]{2}\d{3,4}$/)
    .withMessage('Flight number must be in format: XX123 or XX1234 (e.g., AA1234)'),
  
  body('Source')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Source must be a 3-letter airport code')
    .isUppercase()
    .withMessage('Source must be uppercase'),
  
  body('Destination')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Destination must be a 3-letter airport code')
    .isUppercase()
    .withMessage('Destination must be uppercase'),
  
  body('DepartureTime')
    .isISO8601()
    .withMessage('Departure time must be a valid ISO 8601 date'),
  
  body('ArrivalTime')
    .isISO8601()
    .withMessage('Arrival time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.DepartureTime)) {
        throw new Error('Arrival time must be after departure time');
      }
      return true;
    }),
  
  body('GateId')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Gate ID must be less than 10 characters'),
  
  body('EconomyPrice')
    .isFloat({ min: 0 })
    .withMessage('Economy price must be a positive number'),
  
  body('BusinessPrice')
    .isFloat({ min: 0 })
    .withMessage('Business price must be a positive number'),
  
  body('FirstClassPrice')
    .isFloat({ min: 0 })
    .withMessage('First class price must be a positive number'),
  
  body('TotalSeats')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total seats must be between 1 and 1000'),
  
  body('EconomySeatsAvailable')
    .isInt({ min: 0 })
    .withMessage('Economy seats available must be a non-negative integer'),
  
  body('BusinessSeatsAvailable')
    .isInt({ min: 0 })
    .withMessage('Business seats available must be a non-negative integer'),
  
  body('FirstClassSeatsAvailable')
    .isInt({ min: 0 })
    .withMessage('First class seats available must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * Validation rules for creating a ticket
 */
const validateCreateTicket = [
  body('FlightId')
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
  
  body('UserId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('TravelClass')
    .isIn(['Economy', 'Business', 'First Class'])
    .withMessage('Travel class must be Economy, Business, or First Class'),
  
  body('SeatNumber')
    .trim()
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Seat number must contain only uppercase letters and numbers'),
  
  body('BoardingTime')
    .optional()
    .isISO8601()
    .withMessage('Boarding time must be a valid ISO 8601 date'),
  
  body('Price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('PaymentMode')
    .isIn(['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'])
    .withMessage('Payment mode must be Credit Card, Debit Card, PayPal, or Bank Transfer'),
  
  body('TransactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for ID parameters
 */
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  handleValidationErrors
];

/**
 * Validation rules for pagination query parameters
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateCreateFlight,
  validateCreateTicket,
  validateIdParam,
  validatePagination
};
