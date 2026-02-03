const db = require('../config/db');

const createNotificationTable = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL, -- 'delay', 'gate_change', 'boarding', 'baggage', 'checkin', 'weather'
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Passenger(PassengerId)
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating notifications table:', err.message);
            } else {
                console.log('✅ notifications table created/verified.');
            }
        });

        // Seed some initial notifications for user 1
        db.get("SELECT count(*) as count FROM notifications WHERE user_id = 1", (err, row) => {
            if (!err && row.count === 0) {
                console.log("Seeding notifications...");
                const seedData = [
                    [1, 'checkin', 'Check-in Reminder', 'Online check-in is now open for your flight to Paris!'],
                    [1, 'weather', 'Weather Update', 'It looks like rain in Paris. Don\'t forget your umbrella! ☔'],
                    [1, 'gate_change', 'Gate Change', 'Flight SY1234 is now boarding at Gate B12.']
                ];
                
                const stmt = db.prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)");
                seedData.forEach(notif => stmt.run(notif));
                stmt.finalize();
                console.log("✅ Seed notifications inserted.");
            }
        });
    });
};

createNotificationTable();
