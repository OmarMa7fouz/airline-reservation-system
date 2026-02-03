const db = require('../config/db');

db.serialize(() => {
  // Insert Passengers
  db.run(`
    INSERT OR IGNORE INTO Passenger (Username, Email, PasswordHash, FirstName, LastName, SSN, DateOfBirth, Gender, City, State, PhoneNumber)
    VALUES
      ('john_doe', 'john.doe@example.com', '$2b$10$XDK3u6S9v6r8p2r9q3X5eO', 'John', 'Doe', 'A12345678', '1990-05-15', 'M', 'New York', 'NY', '123-456-7890'),
      ('jane_smith', 'jane.smith@example.com', '$2b$10$XDK3u6S9v6r8p2r9q3X5eO', 'Jane', 'Smith', 'B98765432', '1992-08-20', 'F', 'Los Angeles', 'CA', '987-654-3210')
  `, (err) => { if (err) console.error('Passenger insert error:', err.message); });

  // Insert Flights
  db.run(`
    INSERT OR IGNORE INTO Flight (FlightNumber, Source, Destination, DepartureTime, ArrivalTime, GateId, EconomyPrice, BusinessPrice, FirstClassPrice, TotalSeats, EconomySeatsAvailable, BusinessSeatsAvailable, FirstClassSeatsAvailable)
    VALUES
      ('FL101', 'New York', 'London', '2025-06-01T10:00:00', '2025-06-01T18:00:00', 'G12', 300.00, 600.00, 1000.00, 150, 100, 30, 20),
      ('FL102', 'Los Angeles', 'Tokyo', '2025-06-02T14:00:00', '2025-06-03T06:00:00', 'G15', 500.00, 900.00, 1500.00, 200, 150, 40, 10)
  `, (err) => { if (err) console.error('Flight insert error:', err.message); });

  // Insert SeatAssignments
  db.run(`
    INSERT OR IGNORE INTO SeatAssignment (FlightId, SeatNumber, Class, IsAvailable)
    VALUES
      (1, '1A', 'Business', 1),
      (1, '1B', 'Business', 1),
      (1, '1C', 'Business', 1),
      (1, '10A', 'Economy', 1),
      (1, '10B', 'Economy', 1),
      (1, '10C', 'Economy', 1),
      (2, '2A', 'Business', 1),
      (2, '2B', 'Business', 1),
      (2, '15A', 'Economy', 1),
      (2, '15B', 'Economy', 1)
  `, (err) => { if (err) console.error('SeatAssignment insert error:', err.message); });

  // Insert Tickets
  db.run(`
    INSERT OR IGNORE INTO Tickets (FlightId, UserId, TravelClass, SeatNumber, BoardingTime, Price, PaymentMode, TransactionId)
    VALUES
      (1, 1, 'Economy', '10A', '2025-06-01T09:30:00', 300.00, 'Credit Card', 'TXN202505111200'),
      (2, 2, 'Business', '2A', '2025-06-02T13:30:00', 900.00, 'Debit Card', 'TXN202505111201')
  `, (err) => { if (err) console.error('Ticket insert error:', err.message); });

  // Insert PaymentTransactions
  db.run(`
    INSERT OR IGNORE INTO PaymentTransactions (TicketId, Amount, PaymentMethod, Status, ReferenceNumber)
    VALUES
      (1, 300.00, 'Credit Card', 'Completed', 'REF123456'),
      (2, 900.00, 'Debit Card', 'Completed', 'REF654321')
  `, (err) => { if (err) console.error('PaymentTransaction insert error:', err.message); });

  console.log('✅ Sample data inserted successfully.');
  db.close();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  db.close();
});