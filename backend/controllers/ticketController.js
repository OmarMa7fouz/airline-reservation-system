const db = require('../config/db');

// Create a new ticket
exports.createTicket = (req, res) => {
  const {
    FlightId, UserId, TravelClass, SeatNumber, BoardingTime,
    Price, PaymentMode, TransactionId,
    Status, HeldUntil, Insurance
  } = req.body;

  const query = `
    INSERT INTO Tickets (
      FlightId, UserId, TravelClass, SeatNumber, BoardingTime,
      Price, PaymentMode, TransactionId,
      Status, HeldUntil, Insurance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const ticketStatus = Status || 'Confirmed';
  const holdDate = HeldUntil || null;
  const hasInsurance = Insurance ? 1 : 0;

  db.run(query, [
    FlightId, UserId, TravelClass, SeatNumber, BoardingTime,
    Price, PaymentMode, TransactionId,
    ticketStatus, holdDate, hasInsurance
  ], function (err) {
    if (err) {
      console.error('Error creating ticket:', err.message);
      return res.status(400).json({ error: 'Ticket creation failed.' });
    }
    return res.status(201).json({ message: 'Ticket created successfully', id: this.lastID });
  });
};

// Get all tickets
exports.getAllTickets = (req, res) => {
  const query = `SELECT * FROM Tickets WHERE Status = 'Confirmed'`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving tickets:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve tickets.' });
    }
    return res.status(200).json({ tickets: rows });
  });
};

// Get ticket by ID
exports.getTicketById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM Tickets WHERE TicketId = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error retrieving ticket:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve ticket.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    return res.status(200).json({ ticket: row });
  });
};

// Update a ticket
exports.updateTicket = (req, res) => {
  const { id } = req.params;
  const { SeatNumber, BoardingTime, Status } = req.body;

  const query = `
    UPDATE Tickets
    SET SeatNumber = ?, BoardingTime = ?, Status = ?
    WHERE TicketId = ?
  `;

  db.run(query, [SeatNumber, BoardingTime, Status, id], function (err) {
    if (err) {
      console.error('Error updating ticket:', err.message);
      return res.status(400).json({ error: 'Failed to update ticket.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    return res.status(200).json({ message: 'Ticket updated successfully.' });
  });
};

// Cancel a ticket
exports.cancelTicket = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE Tickets SET Status = 'Cancelled' WHERE TicketId = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error cancelling ticket:', err.message);
      return res.status(500).json({ error: 'Failed to cancel ticket.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    return res.status(200).json({ message: 'Ticket cancelled successfully.' });
  });
};

module.exports = {
  createTicket: exports.createTicket,
  getAllTickets: exports.getAllTickets,
  getTicketById: exports.getTicketById,
  updateTicket: exports.updateTicket,
  cancelTicket: exports.cancelTicket,
};