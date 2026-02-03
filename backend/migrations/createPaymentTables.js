const db = require('../config/db');

/**
 * Migration: Create Payment Related Tables
 */

const createSavedMethodsTable = `
  CREATE TABLE IF NOT EXISTS saved_payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    method_type TEXT NOT NULL, -- 'card', 'paypal'
    provider TEXT, -- 'visa', 'mastercard', 'amex', 'paypal'
    last_four TEXT,
    expiry TEXT, -- MM/YY
    token TEXT NOT NULL, -- Simulated secure token
    card_holder_name TEXT,
    is_default INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES passengers(PassengerId)
  )
`;

async function runMigration() {
  console.log('🚀 Starting Payment Tables Migration...');
  
  await new Promise((resolve, reject) => {
    db.run(createSavedMethodsTable, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Created saved_payment_methods table');

  // Insert sample data for demo user (ID 1)
  const sampleCard = {
    user_id: 1,
    method_type: 'card',
    provider: 'visa',
    last_four: '4242',
    expiry: '12/28',
    token: 'tok_visa_demo_123',
    card_holder_name: 'John Doe'
  };

  await new Promise((resolve, reject) => {
      db.run(`INSERT INTO saved_payment_methods (user_id, method_type, provider, last_four, expiry, token, card_holder_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sampleCard.user_id, sampleCard.method_type, sampleCard.provider, sampleCard.last_four, sampleCard.expiry, sampleCard.token, sampleCard.card_holder_name],
      (err) => {
          if(err) console.error("Sample insert failed (might duplicate)", err);
          resolve();
      });
  });

  console.log('🎉 Payment Tables Migration completed!');
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
