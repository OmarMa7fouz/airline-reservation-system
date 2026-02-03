const db = require('../config/db');

/**
 * Migration: Create Mobile Wallet & Push Tables
 */

const createPushSubscriptionsTable = `
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, endpoint)
  )
`;

const createMobileDealsTable = `
  CREATE TABLE IF NOT EXISTS mobile_deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage REAL,
    image_url TEXT,
    platform TEXT DEFAULT 'any', -- 'ios', 'android', 'any'
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

async function runMigration() {
  try {
    console.log('🚀 Starting Mobile Wallet Tables Migration...');

    await new Promise((resolve, reject) => {
      db.run(createPushSubscriptionsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created push_subscriptions table');

    await new Promise((resolve, reject) => {
      db.run(createMobileDealsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created mobile_deals table');

    // Seed some mobile deals
    const seedDeals = `
      INSERT INTO mobile_deals (title, description, discount_percentage, image_url, platform)
      SELECT 'Mobile App Exclusive', 'Get 10% off your next flight when booking on mobile!', 10.0, '/deals/mobile-special.jpg', 'any'
      WHERE NOT EXISTS (SELECT 1 FROM mobile_deals WHERE title = 'Mobile App Exclusive')
    `;

    await new Promise((resolve, reject) => {
      db.run(seedDeals, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Seeded mobile deals');

    console.log('🎉 Mobile Wallet Tables Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
