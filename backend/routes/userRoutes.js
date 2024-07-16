const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/users', auth, userController.getUsers);
router.get('/users/search', auth, userController.searchUsers);
router.get('/verify-token', auth, userController.verifyToken);

module.exports = router;        