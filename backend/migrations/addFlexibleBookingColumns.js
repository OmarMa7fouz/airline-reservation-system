const db = require('../config/db');

const addFlexibleBookingColumns = () => {
    db.serialize(() => {
        // Add HeldUntil column to Tickets table
        db.run("ALTER TABLE Tickets ADD COLUMN HeldUntil TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error("Error adding HeldUntil column:", err.message);
            } else if (!err) {
                console.log("Verified/Added HeldUntil column to Tickets table.");
            }
        });

        // Add Insurance column to Tickets table
        db.run("ALTER TABLE Tickets ADD COLUMN Insurance INTEGER DEFAULT 0", (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error("Error adding Insurance column:", err.message);
            } else if (!err) {
                console.log("Verified/Added Insurance column to Tickets table.");
            }
        });

        console.log("Flexible booking columns migration completed.");
    });
};

addFlexibleBookingColumns();
