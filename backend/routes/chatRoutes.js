const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUsers, searchUsers } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, sendMessage);
router.get('/messages/:userId', authMiddleware, getMessages);
router.get('/users', authMiddleware, getUsers);
router.get('/search', authMiddleware, searchUsers);

module.exports = router;