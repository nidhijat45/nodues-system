const express = require('express');
const router = express.Router();
const { login, registerStudent, changePassword } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register', registerStudent); // students register khud karte hain
router.put('/change-password', verifyToken, changePassword);

module.exports = router;