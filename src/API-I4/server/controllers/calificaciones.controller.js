const pool = require('../db'); // mysql2/promise

const t = (s) => (typeof s === 'string' ? s.trim() : s);

const createCalificacion = async (req, res) => {
  try {
    const { id_usuario, id_calificado, id_historial, puntuacion, comentario } = req.body || {};

    if (!id_usuario || !id_calificado || !id_historial || puntuacion == null) {
      return res.status(400).json({ error: 'id_usuario, id_calificado, id_historial y puntuacion son obligatorios' });
    }

    const punt = Number(puntuacion);
    if (Number.isNaN(punt) || punt < 1 || punt > 5) {
      return res.status(400).json({ error: 'puntuacion debe ser un número entre 1 y 5' });
    }

    // (básico) verificar que el historial exista para error más claro
    const [[hist]] = await pool.query(
      'SELECT id_historial FROM `Historial_trabajos` WHERE id_historial = ? LIMIT 1',
      [Number(id_historial)]
    );
    if (!hist) return res.status(404).json({ error: 'Historial no encontrado' });

    const sql = `
      INSERT INTO \`Calificaciones\`
        (\`id_usuario\`, \`id_calificado\`, \`id_historial\`, \`puntuacion\`, \`comentario\`)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [ins] = await pool.query(sql, [
      Number(id_usuario),
      Number(id_calificado),
      Number(id_historial),
      punt,
      comentario != null ? t(comentario) : null,
    ]);

    const [[row]] = await pool.query(
      'SELECT * FROM `Calificaciones` WHERE id_calificacion = ? LIMIT 1',
      [ins.insertId]
    );

    return res.status(201).json(row);
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe una calificación para este trabajo entre estos usuarios' });
    }
    console.error('createCalificacion error:', err);
    return res.status(500).json({ error: 'Error al crear calificación' });
  }
};

const getCalificacionesUsuario = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ error: 'id inválido' });

    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    // Lista con info básica del calificador
    const listSql = `
      SELECT c.*,
             u.nombres   AS calificador_nombres,
             u.apellidos AS calificador_apellidos
        FROM \`Calificaciones\` c
        JOIN \`Usuarios\` u ON u.id_usuario = c.id_usuario
       WHERE c.id_calificado = ?
       ORDER BY c.fecha DESC
       LIMIT ? OFFSET ?
    `;
    const [items] = await pool.query(listSql, [userId, limit, offset]);

    // Promedio y total
    const [[agg]] = await pool.query(
      'SELECT ROUND(AVG(puntuacion),2) AS promedio, COUNT(*) AS total FROM `Calificaciones` WHERE id_calificado = ?',
      [userId]
    );

    res.json({
      userId,
      promedio: Number(agg.promedio) || 0,
      total: Number(agg.total) || 0,
      limit,
      offset,
      items,
    });
  } catch (err) {
    console.error('getCalificacionesUsuario error:', err);
    return res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
};

module.exports = {
  createCalificacion,
  getCalificacionesUsuario,
};
