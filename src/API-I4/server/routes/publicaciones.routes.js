const express = require('express');
const {
  marcarPublicacionCompletada,
  patchPublicacion,
  deletePublicacion,
  getPublicacionById,
  getPublicaciones,
  createPublicacion,
} = require('../controllers/publicaciones.controller.js');

const router = express.Router();

router.patch('/publicaciones/:id', patchPublicacion);
router.delete('/publicaciones/:id', deletePublicacion);
router.get('/publicaciones/:id', getPublicacionById); 
router.get('/publicaciones', getPublicaciones);
router.post('/publicaciones', createPublicacion);
router.patch('/publicaciones/:id/completar', marcarPublicacionCompletada);

module.exports = router;
