const express = require('express');

const { signup, login } = require('../controllers/auth.js');

const router = express.Router();

router.post('/signup', signup); // post route because we have to send from front to back 
router.post('/login', login);

module.exports = router;