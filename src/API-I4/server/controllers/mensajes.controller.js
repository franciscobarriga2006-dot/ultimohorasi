const pool = require('../db');

// Cache en memoria compartida con sockets
const IDEMP_CACHE = new Map();
const IDEMP_TTL_MS = 5 * 60 * 1000;
const makeKey = (chatId, clientId) => `${chatId}:${clientId}`;
const setIdemp = (chatId, clientId, msg) => {
  const k = makeKey(chatId, clientId);
  IDEMP_CACHE.set(k, msg);
  setTimeout(() => IDEMP_CACHE.delete(k), IDEMP_TTL_MS);
};
const getIdemp = (chatId, clientId) => IDEMP_CACHE.get(makeKey(chatId, clientId)) || null;

const createMensaje = async (req, res) => {
  try {
    const io = req.app.locals.io;
    const { chatId, from, to, body, client_id } = req.body || {};
    if (!chatId || !from || !to || !body) {
      return res.status(400).json({ error: 'chatId, from, to, body requeridos' });
    }

    const [[c]] = await pool.query(
      `SELECT id_chat FROM Chats
        WHERE id_chat = ? AND (id_usuario1 = ? OR id_usuario2 = ?)
        LIMIT 1`,
      [Number(chatId), Number(from), Number(from)]
    );
    if (!c) return res.status(403).json({ error: 'No perteneces al chat' });

    // Idempotencia en memoria
    if (client_id) {
      const cached = getIdemp(Number(chatId), String(client_id));
      if (cached) {
        io.to(`chat:${chatId}`).emit('message:new', cached);
        return res.status(200).json({ ...cached, dedup: true });
      }
    }

    const [ins] = await pool.query(
      `INSERT INTO Mensajes (id_chat, id_usuariotx, id_usuariorx, mensaje)
       VALUES (?, ?, ?, ?)`,
      [Number(chatId), Number(from), Number(to), String(body).trim()]
    );

    const [[msg]] = await pool.query(
      `SELECT * FROM Mensajes WHERE id_mensaje = ? LIMIT 1`,
      [ins.insertId]
    );

    const out = { ...msg, client_id: client_id || null };
    if (client_id) setIdemp(Number(chatId), String(client_id), out);
    io.to(`chat:${chatId}`).emit('message:new', out);
    return res.status(201).json(out);
  } catch (e) {
    console.error('createMensaje', e);
    return res.status(500).json({ error: 'Error al crear mensaje' });
  }
};

module.exports = { createMensaje };
