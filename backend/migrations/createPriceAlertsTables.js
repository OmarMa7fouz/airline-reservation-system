const db = require('../config/db');

/**
 * Migration: Create Price Alerts Tables
 * Run this file once to set up the price alerts feature
 */

function createPriceAlertsTables() {
  // Create price_alerts table
  const createAlertsTable = `
    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      return_date TEXT,
      max_price REAL NOT NULL,
      current_price REAL,
      email TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_checked TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  // Create price_history table
  const createHistoryTable = `
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      price REAL NOT NULL,
      checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index for faster queries
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active);
    CREATE INDEX IF NOT EXISTS idx_price_history_route ON price_history(origin, destination, departure_date);
  `;

  db.serialize(() => {
    db.run(createAlertsTable, (err) => {
      if (err) {
        console.error('❌ Error creating price_alerts table:', err);
      } else {
        console.log('✅ price_alerts table created successfully');
      }
    });

    db.run(createHistoryTable, (err) => {
      if (err) {
        console.error('❌ Error creating price_history table:', err);
      } else {
        console.log('✅ price_history table created successfully');
      }
    });

    db.exec(createIndexes, (err) => {
      if (err) {
        console.error('❌ Error creating indexes:', err);
      } else {
        console.log('✅ Indexes created successfully');
      }
    });
  });
}

// Run migration
createPriceAlertsTables();

module.exports = { createPriceAlertsTables };
