const db = require('../config/db');

// Create a new flight
exports.createFlight = (req, res) => {
  const {
    FlightNumber, Source, Destination, DepartureTime, ArrivalTime, GateId,
    EconomyPrice, BusinessPrice, FirstClassPrice, TotalSeats,
    EconomySeatsAvailable, BusinessSeatsAvailable, FirstClassSeatsAvailable
  } = req.body;

  const query = `
    INSERT INTO Flight (
      FlightNumber, Source, Destination, DepartureTime, ArrivalTime, GateId,
      EconomyPrice, BusinessPrice, FirstClassPrice, TotalSeats,
      EconomySeatsAvailable, BusinessSeatsAvailable, FirstClassSeatsAvailable
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    FlightNumber, Source, Destination, DepartureTime, ArrivalTime, GateId,
    EconomyPrice, BusinessPrice, FirstClassPrice, TotalSeats,
    EconomySeatsAvailable, BusinessSeatsAvailable, FirstClassSeatsAvailable
  ], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        // Flight already exists, try to retrieve it
        const findQuery = `SELECT FlightId FROM Flight WHERE FlightNumber = ? AND DepartureTime = ?`;
        db.get(findQuery, [FlightNumber, DepartureTime], (findErr, row) => {
          if (findErr || !row) {
             console.error('Error finding existing flight after collision:', findErr);
             return res.status(500).json({ error: 'Flight creation collision error.' });
          }
          console.log(`Flight ${FlightNumber} already exists. Returning existing ID: ${row.FlightId}`);
          return res.status(200).json({ message: 'Flight already exists', id: row.FlightId, existing: true });
        });
        return;
      }
      console.error('Error creating flight:', err.message);
      return res.status(400).json({ error: 'Flight creation failed. ' + err.message });
    }
    return res.status(201).json({ message: 'Flight created successfully', id: this.lastID });
  });
};

// Get all flights
exports.getAllFlights = (req, res) => {
  const query = `SELECT * FROM Flight WHERE IsActive = 1`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving flights:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve flights.' });
    }
    return res.status(200).json({ flights: rows });
  });
};

// Get flight by ID
exports.getFlightById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM Flight WHERE FlightId = ? AND IsActive = 1`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error retrieving flight:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve flight.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Flight not found.' });
    }
    return res.status(200).json({ flight: row });
  });
};

// Update a flight
exports.updateFlight = (req, res) => {
  const { id } = req.params;
  const {
    FlightNumber, Source, Destination, DepartureTime, ArrivalTime, GateId,
    EconomyPrice, BusinessPrice, FirstClassPrice, TotalSeats,
    EconomySeatsAvailable, BusinessSeatsAvailable, FirstClassSeatsAvailable
  } = req.body;

  const query = `
    UPDATE Flight
    SET FlightNumber = ?, Source = ?, Destination = ?, DepartureTime = ?, ArrivalTime = ?, GateId = ?,
        EconomyPrice = ?, BusinessPrice = ?, FirstClassPrice = ?, TotalSeats = ?,
        EconomySeatsAvailable = ?, BusinessSeatsAvailable = ?, FirstClassSeatsAvailable = ?
    WHERE FlightId = ?
  `;

  db.run(query, [
    FlightNumber, Source, Destination, DepartureTime, ArrivalTime, GateId,
    EconomyPrice, BusinessPrice, FirstClassPrice, TotalSeats,
    EconomySeatsAvailable, BusinessSeatsAvailable, FirstClassSeatsAvailable, id
  ], function (err) {
    if (err) {
      console.error('Error updating flight:', err.message);
      return res.status(400).json({ error: 'Failed to update flight.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Flight not found.' });
    }
    return res.status(200).json({ message: 'Flight updated successfully.' });
  });
};

// Delete a flight (soft delete by setting IsActive to 0)
exports.deleteFlight = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE Flight SET IsActive = 0 WHERE FlightId = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting flight:', err.message);
      return res.status(500).json({ error: 'Failed to delete flight.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Flight not found.' });
    }
    return res.status(200).json({ message: 'Flight deleted successfully.' });
  });
};

module.exports = {
  createFlight: exports.createFlight,
  getAllFlights: exports.getAllFlights,
  getFlightById: exports.getFlightById,
  updateFlight: exports.updateFlight,
  deleteFlight: exports.deleteFlight,
};