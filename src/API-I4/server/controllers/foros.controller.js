// controllers/foros.controller.js
const pool = require('../db');

const t = (s) => (typeof s === 'string' ? s.trim() : s);

// GET /foros
const listForos = async (req, res) => {
  try {
    const section = String(req.query.section || 'all').toLowerCase();
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const orderParam = String(req.query.order || '').toLowerCase();

    const q = t((req.query && req.query.q) || '');
    const forumId = Number(
      (req.query && (req.query.forumId || req.query.id_foro || req.query.id)) || 0,
    );
    const title = t((req.query && req.query.title) || '');
    const question = t((req.query && req.query.question) || '');
    const authorId = Number((req.query && (req.query.authorId || req.query.userId)) || 0);
    const createdFrom = t((req.query && (req.query.createdFrom || req.query.fechaDesde)) || '');
    const createdTo = t((req.query && (req.query.createdTo || req.query.fechaHasta)) || '');
    const responseStatus = String((req.query && req.query.responseStatus) || '').toLowerCase();

    const where = [];
    const params = [];

    if (q) {
      where.push('(f.titulo LIKE ? OR f.consulta LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
        if (forumId) {
      where.push('f.id_foro = ?');
      params.push(forumId);
    }
    if (title) {
      where.push('f.titulo LIKE ?');
      params.push(`%${title}%`);
    }
    if (question) {
      where.push('f.consulta LIKE ?');
      params.push(`%${question}%`);
    }
    if (authorId) {
      where.push('f.id_usuario = ?');
      params.push(authorId);
    }
        if (createdFrom) {
      where.push('f.fecha >= ?');
      params.push(`${createdFrom} 00:00:00`);
    }
    if (createdTo) {
      where.push('f.fecha <= ?');
      params.push(`${createdTo} 23:59:59.999`);
    }
    if (responseStatus === 'con-respuestas') {
      where.push('COALESCE(stats.total_respuestas, 0) > 0');
    } else if (responseStatus === 'sin-respuestas') {
      where.push('COALESCE(stats.total_respuestas, 0) = 0');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const joinsSql = [
      'JOIN Usuarios u ON u.id_usuario = f.id_usuario',
      'LEFT JOIN (',
      '  SELECT r.id_foro,',
      '         COUNT(*) AS total_respuestas,',
      '         MAX(r.fecha) AS ultima_respuesta_fecha',
      '  FROM Respuestas_foros r',
      '  GROUP BY r.id_foro',
      ') stats ON stats.id_foro = f.id_foro',
      'LEFT JOIN (',
      '  SELECT r1.id_foro, r1.id_usuario, r1.fecha',
      '  FROM Respuestas_foros r1',
      '  WHERE r1.id_respuesta = (',
      '    SELECT r2.id_respuesta',
      '    FROM Respuestas_foros r2',
      '    WHERE r2.id_foro = r1.id_foro',
      '    ORDER BY r2.fecha DESC, r2.id_respuesta DESC',
      '    LIMIT 1',
      '  )',
      ') last_resp ON last_resp.id_foro = f.id_foro',
      'LEFT JOIN Usuarios uresp ON uresp.id_usuario = last_resp.id_usuario',
    ].join('\n      ');

    let orderClause = 'ORDER BY f.fecha DESC';
    if (section === 'most') {
      orderClause = 'ORDER BY COALESCE(stats.total_respuestas, 0) DESC, f.fecha DESC';
    } else if (section === 'latest') {
      orderClause = 'ORDER BY f.fecha DESC';
    } else if (orderParam === 'asc') {
      orderClause = 'ORDER BY f.fecha ASC';
    }

    const sql = [
      'SELECT',
      '  f.id_foro,',
      '  f.id_usuario,',
      '  f.titulo,',
      '  f.consulta,',
      '  f.fecha,',
      '  u.nombres AS autor_nombres,',
      '  u.apellidos AS autor_apellidos,',
      '  u.correo AS autor_correo,',
      '  COALESCE(stats.total_respuestas, 0) AS respuestas_total,',
      '  stats.ultima_respuesta_fecha,',
      '  last_resp.id_usuario AS ultima_respuesta_usuario_id,',
      '  uresp.nombres AS ultima_respuesta_usuario_nombres,',
      '  uresp.apellidos AS ultima_respuesta_usuario_apellidos,',
      '  uresp.correo AS ultima_respuesta_usuario_correo',
      'FROM Foros f',
      joinsSql,
      whereSql,
      orderClause,
      'LIMIT ? OFFSET ?',
    ]
      .filter(Boolean)
      .join('\n      ');

    const countSql = [
      'SELECT COUNT(DISTINCT f.id_foro) AS total',
      'FROM Foros f',
      joinsSql,
      whereSql,
    ]
      .filter(Boolean)
      .join('\n      ');

    const [rows] = await pool.query(sql, [...params, limit, offset]);
    const [[cRow]] = await pool.query(countSql, params);

    const items = rows.map((row) => ({
      id_foro: row.id_foro,
      id_usuario: row.id_usuario,
      titulo: row.titulo,
      consulta: row.consulta,
      fecha: row.fecha,
      usuario: {
        id_usuario: row.id_usuario,
        nombres: row.autor_nombres,
        apellidos: row.autor_apellidos,
        correo: row.autor_correo,
      },
      respuestas: {
        total: Number(row.respuestas_total) || 0,
        ultimaRespuesta: row.ultima_respuesta_fecha || null,
        ultimoUsuario:
          row.ultima_respuesta_usuario_id
            ? {
                id_usuario: row.ultima_respuesta_usuario_id,
                nombres: row.ultima_respuesta_usuario_nombres,
                apellidos: row.ultima_respuesta_usuario_apellidos,
                correo: row.ultima_respuesta_usuario_correo,
              }
            : null,
      },
    }));

    res.json({
      section,
      limit,
      offset,
      total: Number((cRow && cRow.total) || 0),
      filters: {
        q,
        forumId: forumId || null,
        title,
        question,
        authorId: authorId || null,
        createdFrom,
        createdTo,
        responseStatus: responseStatus || 'todas',
      },
      items,
    });
  } catch (err) {
    console.error('listForos error:', err);
    res.status(500).json({ error: 'Error al listar foros' });
  }
};

// POST /foros
const createForo = async (req, res) => {
  try {
    const bodyUserId = Number((req.body && req.body.id_usuario) || 0);
    const headerUserId = Number(req.header('x-user-id') || 0);
    const userId = headerUserId || bodyUserId;
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'id_usuario requerido' });
    }

    const { titulo, consulta } = req.body || {};
    const tituloOk = t(titulo || '');
    const consultaOk = t(consulta || '');

    if (!tituloOk) return res.status(400).json({ error: 'titulo requerido' });
    if (!consultaOk) return res.status(400).json({ error: 'consulta requerida' });
    if (tituloOk.length > 100) return res.status(400).json({ error: 'titulo demasiado largo (<=100)' });

    const [ins] = await pool.query(
      `INSERT INTO Foros (id_usuario, titulo, consulta) VALUES (?, ?, ?)`,
      [userId, tituloOk, consultaOk]
    );

    const [[row]] = await pool.query(
      `SELECT f.*, u.nombres AS autor_nombres, u.apellidos AS autor_apellidos
         FROM Foros f
         JOIN Usuarios u ON u.id_usuario = f.id_usuario
        WHERE f.id_foro = ? LIMIT 1`,
      [ins.insertId]
    );

    return res.status(201).json(row);
  } catch (err) {
    console.error('createForo error:', err);
    res.status(500).json({ error: 'Error al crear foro' });
  }
};

// GET /foros/:id 
const getForoById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const sql = `
      SELECT 
        f.*,
        u.nombres AS autor_nombres,
        u.apellidos AS autor_apellidos,
        (SELECT COUNT(*) FROM Respuestas_foros r WHERE r.id_foro = f.id_foro) AS respuestas_count
      FROM Foros f
      JOIN Usuarios u ON u.id_usuario = f.id_usuario
      WHERE f.id_foro = ? LIMIT 1
    `;
    const [[row]] = await pool.query(sql, [id]);
    if (!row) return res.status(404).json({ error: 'Foro no encontrado' });

    res.json(row);
  } catch (err) {
    console.error('getForoById error:', err);
    res.status(500).json({ error: 'Error al obtener foro' });
  }
};

// PATCH /foros/:id
const patchForo = async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id') || 0);
    if (!userId) return res.status(400).json({ error: 'x-user-id requerido' });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [[foro]] = await pool.query(
      'SELECT id_foro, id_usuario FROM Foros WHERE id_foro = ? LIMIT 1',
      [id]
    );
    if (!foro) return res.status(404).json({ error: 'Foro no encontrado' });
    if (foro.id_usuario !== userId) return res.status(403).json({ error: 'No autorizado' });

    const sets = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'titulo')) {
      const titulo = t(req.body.titulo || '');
      if (!titulo) return res.status(400).json({ error: 'titulo no puede ir vacío' });
      if (titulo.length > 100) return res.status(400).json({ error: 'titulo demasiado largo (<=100)' });
      sets.push('titulo = ?'); params.push(titulo);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'consulta')) {
      const consulta = t(req.body.consulta || '');
      if (!consulta) return res.status(400).json({ error: 'consulta no puede ir vacía' });
      sets.push('consulta = ?'); params.push(consulta);
    }

    if (!sets.length) return res.status(400).json({ error: 'Nada para actualizar' });

    await pool.query(
      `UPDATE Foros SET ${sets.join(', ')}, fecha = CURRENT_TIMESTAMP(3) WHERE id_foro = ?`,
      [...params, id]
    );

    const [[updated]] = await pool.query(
      `SELECT f.*, u.nombres AS autor_nombres, u.apellidos AS autor_apellidos
         FROM Foros f JOIN Usuarios u ON u.id_usuario = f.id_usuario
        WHERE f.id_foro = ? LIMIT 1`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    console.error('patchForo error:', err);
    res.status(500).json({ error: 'Error al actualizar foro' });
  }
};

// DELETE /foros/:id
const deleteForo = async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id') || 0);
    if (!userId) return res.status(400).json({ error: 'x-user-id requerido' });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [[foro]] = await pool.query(
      'SELECT id_foro, id_usuario FROM Foros WHERE id_foro = ? LIMIT 1',
      [id]
    );
    if (!foro) return res.status(404).json({ error: 'Foro no encontrado' });
    if (foro.id_usuario !== userId) return res.status(403).json({ error: 'No autorizado' });

    await pool.query('DELETE FROM Foros WHERE id_foro = ?', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error('deleteForo error:', err);
    res.status(500).json({ error: 'Error al eliminar foro' });
  }
};
const getActorId = (req) => Number(req.header('x-user-id') || req.query.userId || 0);

const getMisForos = async (req, res) => {
  try {
    const userId = getActorId(req);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const q = t(req.query.q || '');

    const where = ['f.id_usuario = ?'];
    const params = [userId];

    if (q) {
      where.push('(f.titulo LIKE ? OR f.consulta LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const sql = `
      SELECT f.*
        FROM Foros f
       WHERE ${where.join(' AND ')}
       ORDER BY f.fecha DESC
       LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    res.json({ items: rows, limit, offset });
  } catch (e) {
    console.error('getMisForos', e);
    res.status(500).json({ error: 'Error al listar mis foros' });
  }
};
const getPerfilActividad = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ error: 'id inválido' });

    const forosLimit = Math.max(1, Math.min(20, Number(req.query.foros_limit || 5)));
    const respLimit  = Math.max(1, Math.min(20, Number(req.query.respuestas_limit || 5)));

    // Últimos foros del usuario
    const [foros] = await pool.query(
      `SELECT * FROM Foros WHERE id_usuario = ? ORDER BY fecha DESC LIMIT ?`,
      [userId, forosLimit]
    );

    // Últimas respuestas del usuario (con título del foro)
    const respuestasSql = [
      'SELECT r.*, f.titulo AS foro_titulo',
      'FROM Respuestas_foros r',
      'JOIN Foros f ON f.id_foro = r.id_foro',
      'WHERE r.id_usuario = ?',
      'ORDER BY r.fecha DESC',
      'LIMIT ?',
    ].join('\n      ');

    const [respuestas] = await pool.query(respuestasSql, [userId, respLimit]);

    // Promedio y total de calificaciones como calificado
    const [[agg]] = await pool.query(
      `SELECT ROUND(AVG(puntuacion),2) AS promedio, COUNT(*) AS total
         FROM Calificaciones
        WHERE id_calificado = ?`,
      [userId]
    );

    res.json({
      userId,
      calificaciones: {
        promedio: Number((agg && agg.promedio) || 0),
        total: Number((agg && agg.total) || 0),
      },
      ultimos_foros: foros,
      ultimas_respuestas: respuestas,
    });
  } catch (e) {
    console.error('getPerfilActividad', e);
    res.status(500).json({ error: 'Error al obtener actividad de perfil' });
  }
};
const getMisRespuestas = async (req, res) => {
  try {
    const userId = getActorId(req);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const foroId = req.query.foro_id ? Number(req.query.foro_id) : null;

    const where = ['r.id_usuario = ?'];
    const params = [userId];

    if (foroId) {
      where.push('r.id_foro = ?');
      params.push(foroId);
    }

    const sql = `
      SELECT r.*, f.titulo AS foro_titulo
        FROM Respuestas_foros r
        JOIN Foros f ON f.id_foro = r.id_foro
       WHERE ${where.join(' AND ')}
       ORDER BY r.fecha DESC
       LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    res.json({ items: rows, limit, offset });
  } catch (e) {
    console.error('getMisRespuestas', e);
    res.status(500).json({ error: 'Error al listar mis respuestas' });
  }
};
module.exports = {
  listForos,
  createForo,
  getForoById,
  patchForo,
  deleteForo,
  getMisForos,
  getMisRespuestas,
  getPerfilActividad
};