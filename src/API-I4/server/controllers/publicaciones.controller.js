const pool = require('../db'); // mysql2/promise pool

const isProd = process.env.NODE_ENV === 'production';
function getActorId(req) {
  const fromCookie = Number(req.cookies?.uid || 0);
  if (fromCookie) return fromCookie;

  if (!isProd) {
    const fromHeader = Number(req.header('x-user-id') || 0);
    if (fromHeader) return fromHeader;
    const fromQuery = Number(req.query.userId || 0);
    if (fromQuery) return fromQuery;
    const fromBody = Number(req.body?.id_usuario || 0);
    if (fromBody) return fromBody;
  }
  return 0;
}
// ===============================================

// helper para strings
const t = (s) => (typeof s === 'string' ? s.trim() : s);


const ALLOWED_FIELDS = [
  'titulo', 'descripcion', 'direccion', 'horario', 'tipo',
  'monto', 'horas', 'estado', 'ciudad', 'region'
];
const ESTADOS = new Set(['activa', 'pausada', 'cerrada', 'eliminada']);
const marcarPublicacionCompletada = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [[pub]] = await pool.query(
      'SELECT id_publicacion, id_usuario, estado FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [id]
    );
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });

    const userIdHeader = Number(req.header('x-user-id') || 0);
    if (userIdHeader && userIdHeader !== pub.id_usuario) {
      return res.status(403).json({ error: 'No autorizado para completar esta publicación' });
    }

    if (pub.estado === 'cerrada') {
      const [[cerrada]] = await pool.query(
        'SELECT * FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
        [id]
      );
      return res.json(cerrada);
    }

    const [[infoPostulaciones]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM \`Postulaciones\`
        WHERE \`id_publicacion\` = ?
          AND \`estado_postulacion\` = 'aceptada'`,
      [id]
    );

    const totalAceptadas = Number(infoPostulaciones?.total || 0);

    if (!totalAceptadas) {
      return res.status(409).json({ error: 'La publicación no tiene postulaciones aceptadas para marcar como completada' });
    }

    await pool.query(
      `UPDATE \`Publicaciones\`
          SET \`estado\` = 'cerrada',
              \`fecha_actualizacion\` = CURRENT_TIMESTAMP(3)
        WHERE \`id_publicacion\` = ?`,
      [id]
    );

    const [[updated]] = await pool.query(
      'SELECT * FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [id]
    );

    return res.json(updated);
  } catch (err) {
    console.error('marcarPublicacionCompletada error:', err);
    return res.status(500).json({ error: 'Error al marcar publicación como completada' });
  }
};

const patchPublicacion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [rows] = await pool.query(
      'SELECT id_publicacion, id_usuario FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Publicación no encontrada' });

    const pub = rows[0];
    const actorId = getActorId(req);
    if (actorId && actorId !== pub.id_usuario) {
      return res.status(403).json({ error: 'No autorizado para modificar esta publicación' });
    }

    const sets = [];
    const params = [];

    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        let val = req.body[key];
        if (key === 'estado' && val && !ESTADOS.has(String(val))) {
          return res.status(400).json({ error: `estado inválido. Use uno de: ${[...ESTADOS].join(', ')}` });
        }
        if (key === 'monto' && val != null) {
          const n = Number(val);
          if (Number.isNaN(n) || n < 0) return res.status(400).json({ error: 'monto inválido' });
          val = n;
        }
        if (typeof val === 'string') val = t(val);
        sets.push('`' + key + '` = ?');
        params.push(val);
      }
    }

    if (!sets.length) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const sql = `
      UPDATE \`Publicaciones\`
         SET ${sets.join(', ')},
             \`fecha_actualizacion\` = CURRENT_TIMESTAMP(3)
       WHERE \`id_publicacion\` = ?
    `;
    params.push(id);

    await pool.query(sql, params);

    const [out] = await pool.query(
      'SELECT * FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [id]
    );
    return res.json(out[0]);
  } catch (err) {
    console.error('patchPublicacion error:', err);
    return res.status(500).json({ error: 'Error al actualizar publicación' });
  }
};

const deletePublicacion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [rows] = await pool.query(
      'SELECT id_publicacion, id_usuario FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Publicación no encontrada' });

    const pub = rows[0];
    const actorId = getActorId(req);
    if (actorId && actorId !== pub.id_usuario) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta publicación' });
    }

    await pool.query(
      'DELETE FROM `Publicaciones` WHERE id_publicacion = ?',
      [id]
    );

    return res.status(204).send();
  } catch (err) {
    console.error('deletePublicacion error:', err);
    return res.status(500).json({ error: 'Error al eliminar publicación' });
  }
};

const getPublicacionById = async (req, res) => {
  try {
    const idParam = req.params.id;
    
    // ✨ Si el id es "etiquetas", retornar todas las etiquetas disponibles
    if (idParam === 'etiquetas') {
      const [rows] = await pool.query(
        'SELECT id_etiqueta, nombre FROM `Etiquetas` ORDER BY nombre ASC'
      );
      return res.json(rows);
    }

    // Código original para obtener publicación por ID
    const id = Number(idParam);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [[pub]] = await pool.query(
      'SELECT * FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [id]
    );
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });

    const [tags] = await pool.query(
      `SELECT e.id_etiqueta, e.nombre
         FROM Etiquetas e
         JOIN Etiquetas_publicaciones ep ON ep.id_etiqueta = e.id_etiqueta
        WHERE ep.id_publicacion = ?
        ORDER BY e.nombre`,
      [id]
    );

    return res.json({ ...pub, etiquetas: tags });
  } catch (err) {
    console.error('getPublicacionById error:', err);
    return res.status(500).json({ error: 'Error al obtener publicación' });
  }
};

const getPublicaciones = async (req, res) => {
  try {
    const limit  = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    const where = [];
    const params = [];
    const { q, ciudad, region, estado } = req.query || {};

    if (q)       { where.push('(titulo LIKE ? OR descripcion LIKE ?)'); params.push(`%${t(q)}%`, `%${t(q)}%`); }
    if (ciudad)  { where.push('ciudad = ?');  params.push(t(ciudad)); }
    if (region)  { where.push('region = ?');  params.push(t(region)); }
    if (estado)  { where.push('estado = ?');  params.push(t(estado)); }

    if (String(req.query.mine) === '1') {
      const actorId = getActorId(req);
      if (!actorId) return res.status(401).json({ error: 'No autenticado' });
      where.push('id_usuario = ?');
      params.push(actorId);
    }

    const sql = `
      SELECT id_publicacion, id_usuario, titulo, descripcion, direccion, horario,
             tipo, monto, horas, estado, ciudad, region, created_at
      FROM \`Publicaciones\`
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return res.json({ items: rows, limit, offset });
  } catch (err) {
    console.error('getPublicaciones error:', err);
    return res.status(500).json({ error: 'Error al listar publicaciones' });
  }
};

const createPublicacion = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const actorId = getActorId(req);
    if (!actorId) return res.status(401).json({ error: 'No autenticado' });

    const {
      titulo,
      descripcion,
      direccion,
      horario,
      tipo,
      monto,
      horas,
      estado,
      ciudad,
      region,
      etiquetas, // Array de IDs de etiquetas
    } = req.body || {};

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: 'titulo y descripcion son obligatorios' });
    }

    // Validar etiquetas
    if (!Array.isArray(etiquetas) || etiquetas.length === 0) {
      return res.status(400).json({ error: 'Debes seleccionar al menos 1 etiqueta' });
    }

    if (etiquetas.length > 3) {
      return res.status(400).json({ error: 'Solo puedes seleccionar hasta 3 etiquetas' });
    }

    // Iniciar transacción
    await connection.beginTransaction();

    // 1. Insertar la publicación
    const cols = ['id_usuario', 'titulo', 'descripcion'];
    const vals = [actorId, t(titulo), t(descripcion)];

    const opt = { direccion, horario, tipo, horas, ciudad, region };
    for (const [k, v] of Object.entries(opt)) {
      if (v !== undefined) {
        cols.push(k);
        vals.push(t(v));
      }
    }

    if (monto !== undefined) {
      const n = Number(monto);
      if (!Number.isNaN(n)) {
        cols.push('monto');
        vals.push(n);
      }
    }

    if (estado !== undefined) {
      cols.push('estado');
      vals.push(t(estado));
    }

    const placeholders = cols.map(() => '?').join(',');
    const sql = `INSERT INTO \`Publicaciones\` (${cols.map(c => '`'+c+'`').join(',')}) VALUES (${placeholders})`;
    const [result] = await connection.query(sql, vals);
    
    const idPublicacion = result.insertId;

    // 2. Insertar las relaciones con etiquetas
    if (etiquetas.length > 0) {
      // Validar que todas las etiquetas existen
      const [etiquetasExistentes] = await connection.query(
        'SELECT id_etiqueta FROM Etiquetas WHERE id_etiqueta IN (?)',
        [etiquetas]
      );

      if (etiquetasExistentes.length !== etiquetas.length) {
        await connection.rollback();
        return res.status(400).json({ error: 'Una o más etiquetas no existen' });
      }

      // Insertar las relaciones
      const valuesEtiquetas = etiquetas.map(idEtiqueta => [idEtiqueta, idPublicacion]);
      await connection.query(
        'INSERT INTO Etiquetas_publicaciones (id_etiqueta, id_publicacion) VALUES ?',
        [valuesEtiquetas]
      );
    }

    // Commit de la transacción
    await connection.commit();

    // 3. Obtener la publicación completa con sus etiquetas
    const [[publicacion]] = await connection.query(
      'SELECT * FROM `Publicaciones` WHERE id_publicacion = ? LIMIT 1',
      [idPublicacion]
    );

    const [etiquetasPublicacion] = await connection.query(
      `SELECT e.id_etiqueta, e.nombre
       FROM Etiquetas e
       JOIN Etiquetas_publicaciones ep ON ep.id_etiqueta = e.id_etiqueta
       WHERE ep.id_publicacion = ?
       ORDER BY e.nombre`,
      [idPublicacion]
    );

    return res.status(201).json({
      ...publicacion,
      etiquetas: etiquetasPublicacion
    });

  } catch (err) {
    // Rollback en caso de error
    await connection.rollback();
    console.error('createPublicacion error:', err);
    res.status(500).json({ error: 'Error al crear publicación' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getPublicaciones,
  createPublicacion,
  patchPublicacion,
  deletePublicacion,
  getPublicacionById,
  marcarPublicacionCompletada,
};
