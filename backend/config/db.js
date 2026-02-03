const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./airline.db', (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

db.serialize(() => {
  // Passenger table
  db.run(`
    CREATE TABLE IF NOT EXISTS Passenger (
      PassengerId INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT NOT NULL UNIQUE,
      Email TEXT NOT NULL UNIQUE,
      PasswordHash TEXT NOT NULL,
      FirstName TEXT NOT NULL,
      LastName TEXT NOT NULL,
      SSN TEXT UNIQUE,
      DateOfBirth TEXT,
      Gender TEXT,
      City TEXT,
      State TEXT,
      PhoneNumber TEXT,
      CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `, (err) => {
    if (err) console.error('❌ Error creating Passenger table:', err.message);
  });

  // Flight table
  db.run(`
    CREATE TABLE IF NOT EXISTS Flight (
      FlightId INTEGER PRIMARY KEY AUTOINCREMENT,
      FlightNumber TEXT NOT NULL,
      Source TEXT NOT NULL,
      Destination TEXT NOT NULL,
      DepartureTime TEXT NOT NULL,
      ArrivalTime TEXT NOT NULL,
      GateId TEXT,
      EconomyPrice REAL NOT NULL,
      BusinessPrice REAL NOT NULL,
      FirstClassPrice REAL NOT NULL,
      TotalSeats INTEGER NOT NULL,
      EconomySeatsAvailable INTEGER NOT NULL,
      BusinessSeatsAvailable INTEGER NOT NULL,
      FirstClassSeatsAvailable INTEGER NOT NULL,
      IsActive INTEGER DEFAULT 1,
      UNIQUE(FlightNumber, DepartureTime)
    );
  `, (err) => {
    if (err) console.error('❌ Error creating Flight table:', err.message);
  });

  // Tickets table
  db.run(`
    CREATE TABLE IF NOT EXISTS Tickets (
      TicketId INTEGER PRIMARY KEY AUTOINCREMENT,
      FlightId INTEGER NOT NULL,
      UserId INTEGER NOT NULL,
      BookingDate TEXT DEFAULT CURRENT_TIMESTAMP,
      TravelClass TEXT NOT NULL,
      SeatNumber TEXT,
      BoardingTime TEXT,
      Price REAL NOT NULL,
      PaymentMode TEXT,
      TransactionId TEXT,
      Status TEXT DEFAULT 'Confirmed',
      FOREIGN KEY (FlightId) REFERENCES Flight(FlightId),
      FOREIGN KEY (UserId) REFERENCES Passenger(PassengerId)
    );
  `, (err) => {
    if (err) console.error('❌ Error creating Tickets table:', err.message);
  });

  // SeatAssignment table
  db.run(`
    CREATE TABLE IF NOT EXISTS SeatAssignment (
      SeatId INTEGER PRIMARY KEY AUTOINCREMENT,
      FlightId INTEGER NOT NULL,
      SeatNumber TEXT NOT NULL,
      Class TEXT NOT NULL,
      IsAvailable INTEGER DEFAULT 1,
      TicketId INTEGER,
      FOREIGN KEY (FlightId) REFERENCES Flight(FlightId),
      FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId),
      UNIQUE (FlightId, SeatNumber)
    );
  `, (err) => {
    if (err) console.error('❌ Error creating SeatAssignment table:', err.message);
  });

  // PaymentTransactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS PaymentTransactions (
      TransactionId INTEGER PRIMARY KEY AUTOINCREMENT,
      TicketId INTEGER NOT NULL,
      Amount REAL NOT NULL,
      PaymentDate TEXT DEFAULT CURRENT_TIMESTAMP,
      PaymentMethod TEXT NOT NULL,
      Status TEXT NOT NULL,
      ReferenceNumber TEXT,
      FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId)
    );
  `, (err) => {
    if (err) console.error('❌ Error creating PaymentTransactions table:', err.message);
  });

  // Loyalty Points table
  db.run(`
    CREATE TABLE IF NOT EXISTS loyalty_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      tier VARCHAR(20) DEFAULT 'Silver',
      lifetime_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Passenger(PassengerId)
    );
  `, (err) => {
    if (err) console.error('❌ Error creating loyalty_points table:', err.message);
  });

  // Loyalty Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL,
      description TEXT,
      ticket_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Passenger(PassengerId),
      FOREIGN KEY (ticket_id) REFERENCES Tickets(TicketId)
    );
  `, (err) => {
    if (err) console.error('❌ Error creating loyalty_transactions table:', err.message);
  });

  console.log("✅ All tables created successfully.");
});

module.exports = db;