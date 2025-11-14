const express = require('express');
const { createMensaje } = require('../controllers/mensajes.controller.js');

const router = express.Router();
router.post('/mensajes', createMensaje);    
 
module.exports = router;