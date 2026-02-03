const db = require('../config/db');

// Create a new payment transaction
exports.createPaymentTransaction = (req, res) => {
  const { TicketId, Amount, PaymentMethod, Status, ReferenceNumber } = req.body;

  const query = `
    INSERT INTO PaymentTransactions (TicketId, Amount, PaymentMethod, Status, ReferenceNumber)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [TicketId, Amount, PaymentMethod, Status, ReferenceNumber], function (err) {
    if (err) {
      console.error('Error creating payment transaction:', err.message);
      return res.status(400).json({ error: 'Payment transaction creation failed.' });
    }
    return res.status(201).json({ message: 'Payment transaction created successfully', id: this.lastID });
  });
};

// Get all payment transactions
exports.getAllPaymentTransactions = (req, res) => {
  const query = `SELECT * FROM PaymentTransactions`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving payment transactions:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve payment transactions.' });
    }
    return res.status(200).json({ paymentTransactions: rows });
  });
};

// Get payment transaction by ID
exports.getPaymentTransactionById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM PaymentTransactions WHERE TransactionId = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error retrieving payment transaction:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve payment transaction.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Payment transaction not found.' });
    }
    return res.status(200).json({ paymentTransaction: row });
  });
};

// Update a payment transaction
exports.updatePaymentTransaction = (req, res) => {
  const { id } = req.params;
  const { Status, ReferenceNumber } = req.body;

  const query = `
    UPDATE PaymentTransactions
    SET Status = ?, ReferenceNumber = ?
    WHERE TransactionId = ?
  `;

  db.run(query, [Status, ReferenceNumber, id], function (err) {
    if (err) {
      console.error('Error updating payment transaction:', err.message);
      return res.status(400).json({ error: 'Failed to update payment transaction.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment transaction not found.' });
    }
    return res.status(200).json({ message: 'Payment transaction updated successfully.' });
  });
};

// Delete a payment transaction
exports.deletePaymentTransaction = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM PaymentTransactions WHERE TransactionId = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting payment transaction:', err.message);
      return res.status(500).json({ error: 'Failed to delete payment transaction.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment transaction not found.' });
    }
    return res.status(200).json({ message: 'Payment transaction deleted successfully.' });
  });
};

module.exports = {
  createPaymentTransaction: exports.createPaymentTransaction,
  getAllPaymentTransactions: exports.getAllPaymentTransactions,
  getPaymentTransactionById: exports.getPaymentTransactionById,
  updatePaymentTransaction: exports.updatePaymentTransaction,
  deletePaymentTransaction: exports.deletePaymentTransaction,
};