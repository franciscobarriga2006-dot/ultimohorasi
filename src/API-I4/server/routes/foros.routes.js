const express = require('express');
const {
  listForos,
  createForo,
  getForoById,
  patchForo,
  deleteForo,
  getMisForos,
  getMisRespuestas,
} = require('../controllers/foros.controller.js');

const router = express.Router();

router.get('/foros', listForos);
router.post('/foros', createForo);
router.get('/foros/:id', getForoById);    // detalle
router.patch('/foros/:id', patchForo);    // editar propio
router.delete('/foros/:id', deleteForo);  // eliminar propio
router.get('/mis-foros', getMisForos);
router.get('/mis-respuestas', getMisRespuestas);

module.exports = router;
