const express = require('express');
const { getNotificaciones } = require('../controllers/notificaciones.controller.js');

const router = express.Router();
router.get('/notificaciones', getNotificaciones);

module.exports = router;
