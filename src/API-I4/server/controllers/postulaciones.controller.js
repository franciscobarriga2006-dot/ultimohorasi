// controllers/postulaciones.controller.js (CommonJS)
const pool = require("../db");
const ESTADOS = new Set(["aceptada", "rechazada"]);

const isProd = process.env.NODE_ENV === "production";

// Fuente única de actor
function getActorId(req) {
  const fromCookie = Number(req.cookies?.uid || 0);
  if (fromCookie) return fromCookie;

  if (!isProd) {
    const fromHeader = Number(req.header("x-user-id") || 0);
    if (fromHeader) return fromHeader;
    const fromQuery = Number(req.query.userId || 0);
    if (fromQuery) return fromQuery;
    const fromBody = Number(req.body?.id_postulante || 0);
    if (fromBody) return fromBody;
  }
  return 0;
}

// PATCH /postulaciones/:id
const patchPostulacion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id inválido" });

    // actorId disponible por si agregas autorización
    const actorId = getActorId(req);
    if (isProd && !actorId)
      return res.status(401).json({ error: "No autenticado" });

    const { estado_postulacion } = req.body || {};
    const nuevoEstado = String(estado_postulacion || "").trim();

    if (!ESTADOS.has(nuevoEstado)) {
      return res.status(400).json({
        error: "estado_postulacion debe ser 'aceptada' o 'rechazada'",
      });
    }

    const [[row]] = await pool.query(
      "SELECT id_postulacion, estado_postulacion FROM `Postulaciones` WHERE id_postulacion = ? LIMIT 1",
      [id]
    );
    if (!row)
      return res.status(404).json({ error: "Postulación no encontrada" });

    await pool.query(
      `UPDATE \`Postulaciones\`
         SET \`estado_postulacion\` = ?, \`fecha\` = CURRENT_TIMESTAMP(3)
       WHERE \`id_postulacion\` = ?`,
      [nuevoEstado, id]
    );

    const [[updated]] = await pool.query(
      "SELECT * FROM `Postulaciones` WHERE id_postulacion = ? LIMIT 1",
      [id]
    );

    return res.json(updated);
  } catch (err) {
    console.error("patchPostulacion error:", err);
    return res.status(500).json({ error: "Error al actualizar postulación" });
  }
};

// POST /postulaciones
const t = (s) => (typeof s === "string" ? s.trim() : s);

const createPostulacion = async (req, res) => {
  try {
    const actorId = getActorId(req);
    if (!actorId) return res.status(401).json({ error: "No autenticado" });

    const { id_publicacion, mensaje, estado_postulacion } = req.body || {};
    if (!id_publicacion) {
      return res.status(400).json({ error: "id_publicacion es obligatorio" });
    }

    const [[pub]] = await pool.query(
      "SELECT id_publicacion FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1",
      [Number(id_publicacion)]
    );
    if (!pub)
      return res.status(404).json({ error: "Publicación no encontrada" });

    const cols = ["id_publicacion", "id_postulante"];
    const vals = [Number(id_publicacion), Number(actorId)]; // <- usa actorId, ignora body en prod

    if (mensaje !== undefined) {
      cols.push("mensaje");
      vals.push(t(mensaje));
    }
    if (estado_postulacion !== undefined) {
      cols.push("estado_postulacion");
      vals.push(t(estado_postulacion));
    }

    const placeholders = cols.map(() => "?").join(",");
    const sql = `INSERT INTO \`Postulaciones\` (${cols
      .map((c) => "`" + c + "`")
      .join(",")}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, vals);

    const [[row]] = await pool.query(
      "SELECT * FROM `Postulaciones` WHERE id_postulacion = ? LIMIT 1",
      [result.insertId]
    );

    return res.status(201).json(row);
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Ya existe una postulación para este usuario y publicación",
      });
    }
    console.error("createPostulacion error:", err);
    return res.status(500).json({ error: "Error al crear postulación" });
  }
};

// GET /mis_postulaciones
const getMisPostulaciones = async (req, res) => {
  try {
    const userId = getActorId(req);
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    const sql = `
      SELECT
        po.*,
        p.titulo AS publicacion_titulo,
        p.estado AS publicacion_estado,
        p.ciudad AS publicacion_ciudad,
        p.region AS publicacion_region
      FROM \`Postulaciones\` po
      JOIN \`Publicaciones\` p ON p.id_publicacion = po.id_publicacion
      WHERE po.id_postulante = ?
      ORDER BY po.fecha DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [userId, limit, offset]);

    return res.json({ items: rows, limit, offset, userId });
  } catch (err) {
    console.error("getMisPostulaciones error:", err);
    return res.status(500).json({ error: "Error al listar mis postulaciones" });
  }
};

// DELETE /postulaciones/:id
const deletePostulacion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id inválido" });

    const actorId = getActorId(req);
    if (!actorId) return res.status(401).json({ error: "No autenticado" });

    const [[row]] = await pool.query(
      "SELECT id_postulacion, id_postulante FROM Postulaciones WHERE id_postulacion = ? LIMIT 1",
      [id]
    );
    if (!row)
      return res.status(404).json({ error: "Postulación no encontrada" });

    // Solo el postulante propietario puede eliminar (en prod se obliga a autenticación)
    if (Number(row.id_postulante) !== Number(actorId)) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar esta postulación" });
    }

    await pool.query("DELETE FROM Postulaciones WHERE id_postulacion = ?", [
      id,
    ]);

    return res.json({ success: true, id });
  } catch (err) {
    console.error("deletePostulacion error:", err);
    return res.status(500).json({ error: "Error al eliminar postulación" });
  }
};

//  NUEVA FUNCIÓN: GET /postulaciones_recibidas
// Obtiene las postulaciones que otros usuarios han enviado a las publicaciones del usuario en sesión
const getPostulacionesRecibidas = async (req, res) => {
  try {
    const userId = getActorId(req);
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    const sql = `
      SELECT
        po.id_postulacion,
        po.id_publicacion,
        po.id_postulante,
        po.mensaje,
        po.estado_postulacion,
        po.fecha,
        p.titulo AS publicacion_titulo,
        p.estado AS publicacion_estado,
        p.tipo AS publicacion_tipo,
        p.monto AS publicacion_monto,
        u.nombres AS postulante_nombres,
        u.apellidos AS postulante_apellidos,
        u.correo AS postulante_correo
      FROM \`Postulaciones\` po
      JOIN \`Publicaciones\` p ON p.id_publicacion = po.id_publicacion
      JOIN \`Usuarios\` u ON u.id_usuario = po.id_postulante
      WHERE p.id_usuario = ?
      ORDER BY po.fecha DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [userId, limit, offset]);

    return res.json({
      items: rows,
      limit,
      offset,
      userId,
    });
  } catch (err) {
    console.error("getPostulacionesRecibidas error:", err);
    return res
      .status(500)
      .json({ error: "Error al listar postulaciones recibidas" });
  }
};

module.exports = {
  patchPostulacion,
  createPostulacion,
  getMisPostulaciones,
  deletePostulacion,
  getPostulacionesRecibidas, // ✨ Exportar nueva función
};
