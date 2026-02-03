const db = require('../config/db');

exports.getNotifications = (req, res) => {
    const userId = req.user?.id || req.query.userId || 1; // Fallback for demo
    
    const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
        res.json({ success: true, notifications: rows });
    });
};

exports.markAsRead = (req, res) => {
    const { id } = req.params;
    
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update' });
        res.json({ success: true });
    });
};

exports.markAllRead = (req, res) => {
    const userId = req.user?.id || req.body.userId || 1;
    
    db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update' });
        res.json({ success: true });
    });
};

exports.simulateEvent = (req, res) => {
    const { userId, type } = req.body;
    const targetUserId = userId || 1;
    
    let title = 'Update';
    let message = 'You have a new update.';
    
    switch(type) {
        case 'delay':
            title = 'Flight Delayed ⚠️';
            message = 'Your flight SY1234 is delayed by 45 minutes due to air traffic.';
            break;
        case 'gate_change':
            title = 'Gate Change 🚪';
            message = 'Gate change! Your flight is now boarding at Gate C09.';
            break;
        case 'boarding':
            title = 'Boarding Now 🎫';
            message = 'Boarding has started for flight SY1234. Please proceed to the gate.';
            break;
        case 'baggage':
            title = 'Baggage Info 🧳';
            message = 'Your check-in bags will arrive at Carousel 4.';
            break;
        case 'weather':
            title = 'Destination Weather ☀️';
            message = 'It is currently 75°F (24°C) and Sunny at your destination.';
            break;
        default:
            title = 'System Message';
            message = 'This is a test notification.';
    }
    
    const query = `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [targetUserId, type, title, message], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create notification' });
        }
        res.status(201).json({ success: true, message: 'Notification simulated', notification: { id: this.lastID, type, title, message, is_read: 0, created_at: new Date() } });
    });
};
