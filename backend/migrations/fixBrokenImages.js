const db = require('../config/db');

const updates = [
    { destination: 'Dubai (DXB)', url: 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { destination: 'Honolulu (HNL)', url: 'https://images.pexels.com/photos/3784338/pexels-photo-3784338.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { destination: 'Vancouver (YVR)', url: 'https://images.pexels.com/photos/2549269/pexels-photo-2549269.jpeg?auto=compress&cs=tinysrgb&w=800' }
];

const run = () => {
    console.log("Fixing broken package images and cleaning duplicates...");
    db.serialize(() => {
        // 1. Remove duplicates (keep first instance of each name)
        db.run(`
            DELETE FROM travel_packages 
            WHERE id NOT IN (
                SELECT MIN(id) 
                FROM travel_packages 
                GROUP BY name, destination
            )
        `, (err) => {
            if (err) console.error("Error cleaning duplicates:", err);
            else console.log("✅ Duplicates removed.");
        });

        // 2. Update images
        updates.forEach(u => {
            db.run("UPDATE travel_packages SET image_url = ? WHERE destination = ?", [u.url, u.destination], function(err) {
                if(err) console.error(err);
                else console.log(`✅ Updated ${u.destination} (Rows affected: ${this.changes})`);
            });
        });
    });
};

run();
