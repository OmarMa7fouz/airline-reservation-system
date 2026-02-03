const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new passenger
exports.registerPassenger = async (req, res) => {
  const {
    Username, Email, Password, FirstName, LastName,
    SSN, DateOfBirth, Gender, City, State, PhoneNumber
  } = req.body;

  console.log('Register Payload:', req.body); // Debug logging

  try {
    const PasswordHash = await bcrypt.hash(Password, 10);

    const query = `
      INSERT INTO Passenger (
        Username, Email, PasswordHash, FirstName, LastName,
        SSN, DateOfBirth, Gender, City, State, PhoneNumber
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      Username, Email, PasswordHash, FirstName, LastName,
      SSN, DateOfBirth, Gender, City, State, PhoneNumber
    ], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(400).json({ error: 'Username, Email, or SSN may already exist.' });
      }
      return res.status(201).json({ message: 'Passenger registered successfully', id: this.lastID });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed.' });
  }
};

// Login a passenger
exports.loginPassenger = (req, res) => {
  const { Username, Password } = req.body;

  const query = `SELECT * FROM Passenger WHERE Username = ?`;

  db.get(query, [Username], async (err, row) => {
    if (err || !row) {
      return res.status(404).json({ 
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
          timestamp: new Date().toISOString()
        }
      });
    }

    const isMatch = await bcrypt.compare(Password, row.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Invalid password.',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: row.PassengerId,
        username: row.Username,
        email: row.Email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove sensitive data from response
    const { PasswordHash, SSN, ...safeUser } = row;

    return res.status(200).json({ 
      message: 'Login successful',
      token,
      user: safeUser
    });
  });
};

// Get all passengers (with optional email filter)
exports.getAllPassengers = (req, res) => {
  const { Email } = req.query;
  let query = `SELECT * FROM Passenger`;
  const params = [];

  if (Email) {
    query += ` WHERE Email = ?`;
    params.push(Email);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Query Error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve passengers.' });
    }
    return res.status(200).json({ passengers: rows });
  });
};

// Get a passenger by ID
exports.getPassengerById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM Passenger WHERE PassengerId = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to retrieve passenger.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Passenger not found.' });
    }
    return res.status(200).json({ passenger: row });
  });
};

// Update a passenger
exports.updatePassenger = async (req, res) => {
  const { id } = req.params;
  const {
    Username, Email, FirstName, LastName, SSN,
    DateOfBirth, Gender, City, State, PhoneNumber
  } = req.body;

  const query = `
    UPDATE Passenger
    SET Username = ?, Email = ?, FirstName = ?, LastName = ?,
        SSN = ?, DateOfBirth = ?, Gender = ?, City = ?, State = ?, PhoneNumber = ?
    WHERE PassengerId = ?
  `;

  db.run(query, [
    Username, Email, FirstName, LastName, SSN,
    DateOfBirth, Gender, City, State, PhoneNumber, id
  ], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(400).json({ error: 'Failed to update passenger.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Passenger not found.' });
    }
    return res.status(200).json({ message: 'Passenger updated successfully.' });
  });
};

// Delete a passenger
exports.deletePassenger = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Passenger WHERE PassengerId = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to delete passenger.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Passenger not found.' });
    }
    return res.status(200).json({ message: 'Passenger deleted successfully.' });
  });
};

module.exports = {
  registerPassenger: exports.registerPassenger,
  loginPassenger: exports.loginPassenger,
  getAllPassengers: exports.getAllPassengers,
  getPassengerById: exports.getPassengerById,
  updatePassenger: exports.updatePassenger,
  deletePassenger: exports.deletePassenger,
};