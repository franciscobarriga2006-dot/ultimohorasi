const pool = require('../db');

const getNotificaciones = async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id') || req.query.userId || 0);
    if (!userId) return res.status(400).json({ error: 'Falta userId (x-user-id o ?userId=)' });

    const limit  = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const order  = (String(req.query.order || 'desc').toLowerCase() === 'asc') ? 'ASC' : 'DESC';

    // filtros opcionales por fecha
    const before = req.query.before ? new Date(req.query.before) : null;
    const after  = req.query.after  ? new Date(req.query.after)  : null;

    const where = ['id_usuario = ?'];
    const params = [userId];

    if (!isNaN(before?.getTime())) {
      where.push('fecha < ?');
      params.push(before.toISOString().slice(0, 23).replace('Z', ''));
    }
    if (!isNaN(after?.getTime())) {
      where.push('fecha > ?');
      params.push(after.toISOString().slice(0, 23).replace('Z', ''));
    }

    const sql = `
      SELECT id_notificacion, id_usuario, titulo, mensaje, fecha
        FROM Notificaciones
       WHERE ${where.join(' AND ')}
       ORDER BY fecha ${order}
       LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [items] = await pool.query(sql, params);

   
    const [[agg]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM Notificaciones
        WHERE id_usuario = ?`,
      [userId]
    );

    return res.json({
      userId,
      order,
      limit,
      offset,
      total: Number(agg.total) || 0,
      count: items.length,
      items,
    });
  } catch (e) {
    console.error('getNotificaciones', e);
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

module.exports = { getNotificaciones };
