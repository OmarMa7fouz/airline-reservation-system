const db = require('../config/db');

const createCommunityTables = () => {
    db.serialize(() => {
        // Community Posts table
        db.run(`
            CREATE TABLE IF NOT EXISTS community_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT DEFAULT 'story', -- 'story', 'review', 'tip'
                content TEXT NOT NULL,
                location TEXT,
                image_url TEXT,
                likes INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Passenger(PassengerId)
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating community_posts table:', err.message);
            } else {
                console.log('✅ community_posts table created/verified.');
            }
        });

        // Seed some initial data
        db.get("SELECT count(*) as count FROM community_posts", (err, row) => {
            if (!err && row.count === 0) {
                console.log("Seeding community posts...");
                const seedData = [
                    [1, 'story', 'Just landed in Paris! The view from the Eiffel Tower is breathtaking. 🗼 #AirGo #Paris', 'Paris, France', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', 42],
                    [1, 'review', 'Great service on my flight to Tokyo. The sushi meal was surprisingly good! 🍣', 'Tokyo, Japan', null, 15],
                    [1, 'tip', 'Pro tip: Book the morning flight to Santorini for the best sunrise views from the plane.', 'Santorini, Greece', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80', 89]
                ];
                
                const stmt = db.prepare("INSERT INTO community_posts (user_id, type, content, location, image_url, likes) VALUES (?, ?, ?, ?, ?, ?)");
                seedData.forEach(post => stmt.run(post));
                stmt.finalize();
                console.log("✅ Seed data inserted.");
            }
        });
    });
};

createCommunityTables();
