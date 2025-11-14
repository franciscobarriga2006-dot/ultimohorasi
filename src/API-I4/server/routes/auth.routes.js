const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { login, register } = require('../controllers/auth.controller.js');

const router  = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router; 