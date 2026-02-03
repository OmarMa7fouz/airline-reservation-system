const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/posts', communityController.getAllPosts);
router.post('/posts', communityController.createPost);
router.post('/posts/:id/like', communityController.likePost);

module.exports = router;
