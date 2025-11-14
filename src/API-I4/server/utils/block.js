const pool = require('../db');


async function isBlocked(a, b) {
  const [rows] = await pool.query(
    `SELECT 1
       FROM Lista_bloqueos
      WHERE (id_usuario = ? AND id_bloqueado = ?)
         OR (id_usuario = ? AND id_bloqueado = ?)
      LIMIT 1`,
    [a, b, b, a]
  );
  return rows.length > 0;
}

module.exports = { isBlocked };
