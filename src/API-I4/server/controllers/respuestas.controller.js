// controllers/respuestas.controller.js
const pool = require('../db');
const t = (s) => (typeof s === 'string' ? s.trim() : s);

// POST /foros/:id/respuestas  (
const createRespuesta = async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id') || 0);
    if (!userId) return res.status(400).json({ error: 'x-user-id requerido' });

    const idForo = Number(req.params.id);
    if (!idForo) return res.status(400).json({ error: 'id de foro inválido' });

    // foro existe?
    const [[foro]] = await pool.query(
      'SELECT id_foro FROM Foros WHERE id_foro = ? LIMIT 1',
      [idForo]
    );
    if (!foro) return res.status(404).json({ error: 'Foro no encontrado' });

    const { respuesta } = req.body || {};
    const respOk = t(respuesta || '');
    if (!respOk) return res.status(400).json({ error: 'respuesta requerida' });

    const [ins] = await pool.query(
      `INSERT INTO Respuestas_foros (id_foro, id_usuario, respuesta)
       VALUES (?, ?, ?)`,
      [idForo, userId, respOk]
    );

    const [[row]] = await pool.query(
      `SELECT r.*, u.nombres AS autor_nombres, u.apellidos AS autor_apellidos
         FROM Respuestas_foros r
         JOIN Usuarios u ON u.id_usuario = r.id_usuario
        WHERE r.id_respuesta = ? LIMIT 1`,
      [ins.insertId]
    );

    return res.status(201).json(row);
  } catch (err) {
    console.error('createRespuesta error:', err);
    res.status(500).json({ error: 'Error al crear respuesta' });
  }
};

// PATCH /respuestas/:id  
const patchRespuesta = async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id') || 0);
    if (!userId) return res.status(400).json({ error: 'x-user-id requerido' });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [[row]] = await pool.query(
      `SELECT id_respuesta, id_usuario, respuesta
         FROM Respuestas_foros WHERE id_respuesta = ? LIMIT 1`,
      [id]
    );
    if (!row) return res.status(404).json({ error: 'Respuesta no encontrada' });
    if (row.id_usuario !== userId) return res.status(403).json({ error: 'No autorizado' });

    const { respuesta } = req.body || {};
    const respOk = t(respuesta || '');
    if (!respOk) return res.status(400).json({ error: 'respuesta requerida' });

    await pool.query(
      `UPDATE Respuestas_foros
          SET respuesta = ?, fecha = CURRENT_TIMESTAMP(3)
        WHERE id_respuesta = ?`,
      [respOk, id]
    );

    const [[updated]] = await pool.query(
      `SELECT r.*, u.nombres AS autor_nombres, u.apellidos AS autor_apellidos
         FROM Respuestas_foros r
         JOIN Usuarios u ON u.id_usuario = r.id_usuario
        WHERE r.id_respuesta = ? LIMIT 1`,
      [id]
    );

    return res.json(updated);
  } catch (err) {
    console.error('patchRespuesta error:', err);
    res.status(500).json({ error: 'Error al actualizar respuesta' });
  }
};

// GET /foros/:id/respuestas
const listRespuestas = async (req, res) => {
  try {
    const idForo = Number(req.params.id);
    if (!idForo) return res.status(400).json({ error: 'id de foro inválido' });

    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const [[foro]] = await pool.query(
      'SELECT id_foro FROM Foros WHERE id_foro = ? LIMIT 1',
      [idForo]
    );
    if (!foro) return res.status(404).json({ error: 'Foro no encontrado' });

    const sql = `
      SELECT r.*, u.nombres AS autor_nombres, u.apellidos AS autor_apellidos
        FROM Respuestas_foros r
        JOIN Usuarios u ON u.id_usuario = r.id_usuario
       WHERE r.id_foro = ?
       ORDER BY r.fecha ${order}
       LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [idForo, limit, offset]);

    res.json({
      id_foro: idForo,
      order,
      limit,
      offset,
      count: rows.length,
      items: rows,
    });
  } catch (err) {
    console.error('listRespuestas error:', err);
    res.status(500).json({ error: 'Error al listar respuestas' });
  }
};
// DELETE /respuestas/:id  (eliminar propia respuesta)
const deleteRespuesta = async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id') || 0);
    if (!userId) return res.status(400).json({ error: 'x-user-id requerido' });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const [[row]] = await pool.query(
      'SELECT id_respuesta, id_usuario FROM Respuestas_foros WHERE id_respuesta = ? LIMIT 1',
      [id]
    );
    if (!row) return res.status(404).json({ error: 'Respuesta no encontrada' });
    if (row.id_usuario !== userId) return res.status(403).json({ error: 'No autorizado' });

    await pool.query('DELETE FROM Respuestas_foros WHERE id_respuesta = ?', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error('deleteRespuesta error:', err);
    res.status(500).json({ error: 'Error al eliminar respuesta' });
  }
};
module.exports = {
  createRespuesta,
  patchRespuesta,
  listRespuestas,
  deleteRespuesta,
};
