const express = require("express");
const {
  createPostulacion,
  getMisPostulaciones,
  patchPostulacion,
  deletePostulacion,
  getPostulacionesRecibidas, //  Nueva importación
} = require("../controllers/postulaciones.controller.js");

const router = express.Router();

router.patch("/postulaciones/:id", patchPostulacion);
router.post("/postulaciones", createPostulacion);
router.get("/mis_postulaciones", getMisPostulaciones);
router.delete("/postulaciones/:id", deletePostulacion);
router.get("/postulaciones_recibidas", getPostulacionesRecibidas); //  Nueva ruta

module.exports = router;
