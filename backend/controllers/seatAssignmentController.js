const db = require('../config/db');

// Create a new seat assignment
exports.createSeatAssignment = (req, res) => {
  const { FlightId, SeatNumber, Class, IsAvailable, TicketId } = req.body;

  const query = `
    INSERT INTO SeatAssignment (FlightId, SeatNumber, Class, IsAvailable, TicketId)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [FlightId, SeatNumber, Class, IsAvailable, TicketId], function (err) {
    if (err) {
      console.error('Error creating seat assignment:', err.message);
      return res.status(400).json({ error: 'Seat assignment creation failed.' });
    }
    return res.status(201).json({ message: 'Seat assignment created successfully', id: this.lastID });
  });
};

// Get all seat assignments
exports.getAllSeatAssignments = (req, res) => {
  const { FlightId } = req.query;
  let query = `SELECT * FROM SeatAssignment`;
  const params = [];

  if (FlightId) {
    query += ` WHERE FlightId = ?`;
    params.push(FlightId);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error retrieving seat assignments:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve seat assignments.' });
    }
    return res.status(200).json({ seatAssignments: rows });
  });
};

// Get seat assignment by ID
exports.getSeatAssignmentById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM SeatAssignment WHERE SeatId = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error retrieving seat assignment:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve seat assignment.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Seat assignment not found.' });
    }
    return res.status(200).json({ seatAssignment: row });
  });
};

// Update a seat assignment
exports.updateSeatAssignment = (req, res) => {
  const { id } = req.params;
  const { IsAvailable, TicketId } = req.body;

  const query = `
    UPDATE SeatAssignment
    SET IsAvailable = ?, TicketId = ?
    WHERE SeatId = ?
  `;

  db.run(query, [IsAvailable, TicketId, id], function (err) {
    if (err) {
      console.error('Error updating seat assignment:', err.message);
      return res.status(400).json({ error: 'Failed to update seat assignment.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Seat assignment not found.' });
    }
    return res.status(200).json({ message: 'Seat assignment updated successfully.' });
  });
};

// Delete a seat assignment
exports.deleteSeatAssignment = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM SeatAssignment WHERE SeatId = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting seat assignment:', err.message);
      return res.status(500).json({ error: 'Failed to delete seat assignment.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Seat assignment not found.' });
    }
    return res.status(200).json({ message: 'Seat assignment deleted successfully.' });
  });
};

module.exports = {
  createSeatAssignment: exports.createSeatAssignment,
  getAllSeatAssignments: exports.getAllSeatAssignments,
  getSeatAssignmentById: exports.getSeatAssignmentById,
  updateSeatAssignment: exports.updateSeatAssignment,
  deleteSeatAssignment: exports.deleteSeatAssignment,
};