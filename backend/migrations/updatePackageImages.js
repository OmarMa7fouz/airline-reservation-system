const db = require('../config/db');

const updates = [
    { destination: 'Dubai (DXB)', url: 'https://images.unsplash.com/photo-1512453979798-5ea90b798d5c?auto=format&fit=crop&w=800&q=80' },
    { destination: 'Paris (CDG)', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { destination: 'Tokyo (NRT)', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' },
    { destination: 'Cancun (CUN)', url: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=800&q=80' },
    { destination: 'London (LHR)', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' }
];

const run = () => {
    console.log("Updating package images...");
    db.serialize(() => {
        let completed = 0;
        updates.forEach(u => {
            db.run("UPDATE travel_packages SET image_url = ? WHERE destination = ?", [u.url, u.destination], function(err) {
                if(err) console.error(`Error updating ${u.destination}:`, err);
                else console.log(`✅ Updated ${u.destination} (Rows affected: ${this.changes})`);
                
                completed++;
                if(completed === updates.length) {
                    console.log("All updates complete.");
                    // We don't exit process here because db connection might be shared/managed differently, 
                    // but usually for a script, we should. db.js might not expose close.
                    // We'll just let the tool finish.
                }
            });
        });
    });
};

run();
