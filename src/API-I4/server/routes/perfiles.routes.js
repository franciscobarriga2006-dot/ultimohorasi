const express = require('express');
const { getPerfil, patchPerfil, createPerfil, patchUsuarioDatos } = require('../controllers/perfiles.controller.js');
const {
  getPerfilActividad,
} = require('../controllers/foros.controller.js');

const router = express.Router();

router.get('/perfil/:id', getPerfil);
router.patch('/perfil/:id', patchPerfil); // propio (x-user-id debe coincidir)
router.get('/perfil/:id/actividad', getPerfilActividad);
router.post('/perfil', createPerfil);
router.patch('/perfil/:id/datos', patchUsuarioDatos);

module.exports = router;
