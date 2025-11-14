const express = require('express');
const {
  createCalificacion,
  getCalificacionesUsuario,
} = require('../controllers/calificaciones.controller.js');

const router = express.Router();

router.post('/calificaciones', createCalificacion);
router.get('/users/:id/calificaciones', getCalificacionesUsuario);

module.exports = router;
