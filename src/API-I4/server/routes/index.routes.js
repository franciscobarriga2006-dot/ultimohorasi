const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('../db');

const router  = express.Router();


router.get('/api/ping', (req, res) => {
  const now = new Date();
  res.json({
    ok: true,
    utc: now.toISOString()
  });
});
module.exports = router; 