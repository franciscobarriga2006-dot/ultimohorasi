const express = require('express');
const {
  createRespuesta, patchRespuesta, listRespuestas, deleteRespuesta } = require('../controllers/respuestas.controller.js');

const router = express.Router();

router.post('/foros/:id/respuestas', createRespuesta);
router.patch('/respuestas/:id', patchRespuesta);
router.get('/foros/:id/respuestas', listRespuestas);
router.delete('/respuestas/:id', deleteRespuesta);
module.exports = router;
