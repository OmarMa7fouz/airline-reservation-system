const db = require('../config/db');

/**
 * Create loyalty_points table
 */
const createLoyaltyPointsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS loyalty_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      tier VARCHAR(20) DEFAULT 'Silver',
      lifetime_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES passengers(id)
    )
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating loyalty_points table:', err);
    } else {
      console.log('✅ Loyalty points table created successfully');
    }
  });
};

/**
 * Create loyalty_transactions table for history
 */
const createLoyaltyTransactionsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL,
      description TEXT,
      ticket_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES passengers(id),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    )
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating loyalty_transactions table:', err);
    } else {
      console.log('✅ Loyalty transactions table created successfully');
    }
  });
};

// Initialize tables
createLoyaltyPointsTable();
createLoyaltyTransactionsTable();

module.exports = {
  createLoyaltyPointsTable,
  createLoyaltyTransactionsTable,
};
