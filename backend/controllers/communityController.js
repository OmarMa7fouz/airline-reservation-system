const db = require('../config/db');

exports.getAllPosts = (req, res) => {
    const query = `
        SELECT 
            cp.*, 
            p.FirstName, 
            p.LastName 
        FROM community_posts cp
        JOIN Passenger p ON cp.user_id = p.PassengerId
        ORDER BY cp.created_at DESC
        LIMIT 50
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }
        res.json({ success: true, posts: rows });
    });
};

exports.createPost = (req, res) => {
    const { userId, type, content, location, imageUrl } = req.body;
    
    if (!userId || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO community_posts (user_id, type, content, location, image_url) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [userId, type || 'story', content, location, imageUrl], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create post' });
        }
        res.status(201).json({ success: true, id: this.lastID, message: 'Post created successfully' });
    });
};

exports.likePost = (req, res) => {
    const { id } = req.params;
    
    db.run(`UPDATE community_posts SET likes = likes + 1 WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to like post' });
        }
        res.json({ success: true, message: 'Post liked' });
    });
};
