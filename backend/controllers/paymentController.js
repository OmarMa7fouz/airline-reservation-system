const db = require('../config/db');

// Get saved payment methods for a user
exports.getSavedMethods = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    db.all('SELECT * FROM saved_payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, methods: rows });
    });
};

// Save a new payment method
exports.saveMethod = async (req, res) => {
    const { userId, methodType, provider, lastFour, expiry, token, cardHolderName } = req.body;

    // Simple validation
    if (!userId || !token) return res.status(400).json({ error: 'Missing required fields' });

    const query = `
        INSERT INTO saved_payment_methods (user_id, method_type, provider, last_four, expiry, token, card_holder_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [userId, methodType, provider, lastFour, expiry, token, cardHolderName], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save method' });
        }
        res.status(201).json({ success: true, id: this.lastID });
    });
};
