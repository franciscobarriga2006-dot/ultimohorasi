const pool = require('../db');
const { isBlocked } = require('../utils/block.js');

const createChat = async (req, res) => {
  try {
    const a = Number(req.body.userA);
    const b = Number(req.body.userB);
    if (!a || !b || a === b) return res.status(400).json({ error: 'userA y userB válidos' });

    if (await isBlocked(a, b)) {
      return res.status(403).json({ error: 'No se puede crear chat: usuarios bloqueados' });
    }

    const u1 = Math.min(a, b), u2 = Math.max(a, b);
    const [[exist]] = await pool.query(
      `SELECT id_chat FROM Chats WHERE id_usuario1 = ? AND id_usuario2 = ? LIMIT 1`,
      [u1, u2]
    );
    if (exist) return res.status(200).json({ id_chat: exist.id_chat });

    const [ins] = await pool.query(
      `INSERT INTO Chats (id_usuario1, id_usuario2) VALUES (?, ?)`,
      [u1, u2]
    );
    return res.status(201).json({ id_chat: ins.insertId });
  } catch (e) {
    console.error('createChat', e);
    res.status(500).json({ error: 'Error al crear chat' });
  }
};

const getChats = async (req, res) => {
  try {
    const userId = Number(req.query.userId || req.header('x-user-id'));
    if (!userId) return res.status(400).json({ error:'userId requerido' });

    // Devuelve el "peer" (la otra persona del chat),
    // el último mensaje y la fecha del último mensaje (o la fecha del chat si no hay mensajes).
    const [rows] = await pool.query(
      `
      SELECT
        c.id_chat,
        CASE WHEN c.id_usuario1 = ? THEN c.id_usuario2 ELSE c.id_usuario1 END AS peer_id,
        TRIM(CONCAT(COALESCE(u.nombres,''),' ',COALESCE(u.apellidos,''))) AS peer_name,
        (
          SELECT m.mensaje           
          FROM Mensajes m
          WHERE m.id_chat = c.id_chat
          ORDER BY m.fecha DESC
          LIMIT 1
        ) AS lastMessage,
        COALESCE(
          (
            SELECT m.fecha
            FROM Mensajes m
            WHERE m.id_chat = c.id_chat
            ORDER BY m.fecha DESC
            LIMIT 1
          ),
          c.fecha
        ) AS lastFecha
      FROM Chats c
      JOIN Usuarios u
        ON u.id_usuario = CASE WHEN c.id_usuario1 = ? THEN c.id_usuario2 ELSE c.id_usuario1 END
      WHERE c.id_usuario1 = ? OR c.id_usuario2 = ?
      ORDER BY lastFecha DESC
      `,
      [userId, userId, userId, userId]
    );

    // Respuesta ya en el shape que espera tu componente
    const items = rows.map(r => ({
      id_chat: r.id_chat,
      peer_id: r.peer_id,                 // ← necesario para enviar
      name: r.peer_name || `Usuario #${r.peer_id}`,
      lastMessage: r.lastMessage || "",
      fecha: r.lastFecha
    }));
    res.json({ items });
  } catch (e) {
    console.error('getChats', e);
    res.status(500).json({ error:'Error al listar chats' });
  }
};

const getMensajes = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    if (!chatId) return res.status(400).json({ error: 'chatId inválido' });

    const userId = Number(req.query.userId || req.header('x-user-id') || 0);
    if (userId) {
      const [[own]] = await pool.query(
        `SELECT 1 FROM Chats
          WHERE id_chat = ?
            AND (id_usuario1 = ? OR id_usuario2 = ?)
          LIMIT 1`,
        [chatId, userId, userId]
      );
      if (!own) return res.status(403).json({ error: 'No autorizado' });
    }

    const limit  = Math.max(1, Math.min(100, Number(req.query.limit || 50)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    // Opción A: tienes columna fecha
    const [rows] = await pool.query(
      `SELECT
         id_mensaje   AS id,
         id_chat,
         id_usuariotx,
         id_usuariorx,
         mensaje,
         fecha
       FROM Mensajes
       WHERE id_chat = ?
       ORDER BY fecha ASC, id_mensaje ASC
       LIMIT ? OFFSET ?`,
      [chatId, limit, offset]
    );
    res.json({ items: rows, limit, offset });
  } catch (e) {
    console.error('getMensajes', e);
    res.status(500).json({ error: 'Error al listar mensajes' });
  }
};


module.exports = { createChat,getMensajes,getChats };
