const db = require('../config/db');

/**
 * Migration: Create Personalization Engine Tables
 * 
 * This migration creates tables for user personalization:
 * - user_preferences: Seat, meal, and travel preferences
 * - user_travel_history: Track booking patterns
 * - special_occasions: Birthdays, anniversaries, etc.
 * - personalized_offers: Targeted offers for users
 */

const createUserPreferencesTable = `
  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    
    -- Seat Preferences
    preferred_seat_type TEXT DEFAULT 'window',
    preferred_seat_location TEXT DEFAULT 'front',
    
    -- Meal Preferences
    meal_preference TEXT DEFAULT 'standard',
    dietary_restrictions TEXT,
    
    -- Travel Preferences
    preferred_class TEXT DEFAULT 'economy',
    preferred_airlines TEXT,
    preferred_departure_time TEXT DEFAULT 'morning',
    
    -- Notification Preferences
    email_notifications INTEGER DEFAULT 1,
    sms_notifications INTEGER DEFAULT 0,
    push_notifications INTEGER DEFAULT 1,
    
    -- Accessibility
    wheelchair_assistance INTEGER DEFAULT 0,
    special_assistance TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`;

const createTravelHistoryTable = `
  CREATE TABLE IF NOT EXISTS user_travel_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- Route Information
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    route_frequency INTEGER DEFAULT 1,
    
    -- Preferences from this route
    preferred_time TEXT,
    average_price REAL,
    
    -- Tracking
    last_traveled DATE,
    first_traveled DATE,
    total_bookings INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, origin, destination)
  )
`;

const createSpecialOccasionsTable = `
  CREATE TABLE IF NOT EXISTS special_occasions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    occasion_type TEXT NOT NULL,
    occasion_date DATE NOT NULL,
    occasion_name TEXT,
    
    -- Offer tracking
    offer_sent INTEGER DEFAULT 0,
    offer_sent_date DATE,
    offer_used INTEGER DEFAULT 0,
    
    -- Reminder settings
    reminder_enabled INTEGER DEFAULT 1,
    reminder_days_before INTEGER DEFAULT 7,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`;

const createPersonalizedOffersTable = `
  CREATE TABLE IF NOT EXISTS personalized_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    offer_type TEXT NOT NULL,
    offer_title TEXT NOT NULL,
    offer_description TEXT,
    
    -- Offer details
    discount_percentage REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    promo_code TEXT UNIQUE,
    
    -- Validity
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Usage
    is_active INTEGER DEFAULT 1,
    is_used INTEGER DEFAULT 0,
    used_date DATE,
    
    -- Targeting
    route_specific TEXT,
    min_purchase_amount REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`;

// Create indexes for better query performance
const createIndexes = [
  `CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON user_preferences(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_travel_history_user ON user_travel_history(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_travel_history_route ON user_travel_history(origin, destination)`,
  `CREATE INDEX IF NOT EXISTS idx_occasions_user ON special_occasions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_occasions_date ON special_occasions(occasion_date)`,
  `CREATE INDEX IF NOT EXISTS idx_offers_user ON personalized_offers(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_offers_active ON personalized_offers(is_active, valid_until)`,
];

async function runMigration() {
  try {
    console.log('🚀 Starting Personalization Engine Tables Migration...');

    // Create tables
    await new Promise((resolve, reject) => {
      db.run(createUserPreferencesTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created user_preferences table');

    await new Promise((resolve, reject) => {
      db.run(createTravelHistoryTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created user_travel_history table');

    await new Promise((resolve, reject) => {
      db.run(createSpecialOccasionsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created special_occasions table');

    await new Promise((resolve, reject) => {
      db.run(createPersonalizedOffersTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created personalized_offers table');

    // Create indexes
    for (const indexQuery of createIndexes) {
      await new Promise((resolve, reject) => {
        db.run(indexQuery, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('✅ Created indexes');

    console.log('🎉 Personalization Engine Tables Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
