console.log('🧠 Cargando módulo chat.socket.js...');

// server/socket/chat.socket.js
const pool = require('../db');
const { randomUUID } = require('crypto');

// Cache en memoria: key = `${chatId}:${client_id}`  -> mensajeGuardado
// TTL simple para no crecer indefinidamente
const IDEMP_CACHE = new Map();
const IDEMP_TTL_MS = 5 * 60 * 1000; // 5 minutos
function makeKey(chatId, clientId) { return `${chatId}:${clientId}`; }
function setIdemp(chatId, clientId, msg) {
  const key = makeKey(chatId, clientId);
  IDEMP_CACHE.set(key, msg);
  setTimeout(() => IDEMP_CACHE.delete(key), IDEMP_TTL_MS);
}
function getIdemp(chatId, clientId) {
  return IDEMP_CACHE.get(makeKey(chatId, clientId)) || null;
}

module.exports = function (io) {
  io.use((socket, next) => {
    const userId = Number(socket.handshake.query.userId);
    if (!userId) return next(new Error('userId requerido'));
    socket.userId = userId;
    next();
  });
///////////////////////////////////////// CONECTARSE A WEBSOCKET ///////////////////////////
  io.on('connection', (socket) => {
    console.log(`🟢 Usuario conectado: ${socket.userId}`);
    const userId = socket.userId;
    socket.join(`user:${userId}`);

////////////////////////////// INGRESAR A UN CHAT ///////////////////////////////////
socket.on('chat:join', async ({ chatId } = {}, ack) => {
  console.log(`🟣 chat:join recibido → userId=${userId}, chatId=${chatId}`);

  try {
    const chatIdNum = Number(chatId);
    if (!chatIdNum || Number.isNaN(chatIdNum)) {
      console.log('❌ chat:join → chatId inválido');
      return ack && ack({ ok: false, error: 'chatId inválido' });
    }

    const [[row]] = await pool.query(
      `SELECT id_chat
         FROM Chats
        WHERE id_chat = ?
          AND (id_usuario1 = ? OR id_usuario2 = ?)
        LIMIT 1`,
      [chatIdNum, userId, userId]
    );

    if (!row) {
      console.log(`⚠️ chat:join → userId=${userId} no pertenece al chat ${chatIdNum}`);
      return ack && ack({ ok: false, error: 'No puedes unirte a este chat' });
    }

    socket.join(`chat:${chatIdNum}`);
    console.log(`✅ chat:join → userId=${userId} unido a chat:${chatIdNum}`);
    return ack && ack({ ok: true });

  } catch (e) {
    console.error(`💥 chat:join Error → userId=${userId}, chatId=${chatId}`, e);
    return ack && ack({ ok: false, error: 'Error al unirse' });
  }
});
///////////////////////////// OBTENER O CREAR CHAT //////////////////////////////
   socket.on('chat:get_or_create', async ({ to } = {}, ack) => {
  console.log(`🟣 chat:get_or_create recibido → userId=${userId}, to=${to}`);
  try {
    const other = Number(to);
    const a = Math.min(userId, other);
    const b = Math.max(userId, other);

    if (!other || Number.isNaN(other)) {
      console.log('❌ chat:get_or_create → destinatario inválido');
      return ack && ack({ ok: false, error: 'Destinatario inválido' });
    }
    if (a === b) {
      console.log('⚠️ chat:get_or_create → intento de chat consigo mismo');
      return ack && ack({ ok: false, error: 'No puedes chatear contigo mismo' });
    }

    // Verificar si ya existe
    const [[exist]] = await pool.query(
      `SELECT id_chat FROM Chats WHERE id_usuario1 = ? AND id_usuario2 = ? LIMIT 1`,
      [a, b]
    );

    if (exist) {
      console.log(`✅ chat:get_or_create → chat existente id=${exist.id_chat}`);
      return ack && ack({ ok: true, chatId: exist.id_chat });
    }

    // Intentar crear si no existe
    const [ins] = await pool.query(
      `INSERT INTO Chats (id_usuario1, id_usuario2) VALUES (?, ?)`,
      [a, b]
    );
    console.log(`🆕 chat:get_or_create → chat creado id=${ins.insertId}`);
    return ack && ack({ ok: true, chatId: ins.insertId });

  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      // Si se generó duplicado concurrentemente, recuperar el existente
      const [[exist2]] = await pool.query(
        `SELECT id_chat FROM Chats WHERE id_usuario1 = ? AND id_usuario2 = ? LIMIT 1`,
        [Math.min(userId, Number(to)), Math.max(userId, Number(to))]
      );
      console.log(`♻️ chat:get_or_create → duplicado, devolviendo existente id=${exist2?.id_chat}`);
      return ack && ack({ ok: true, chatId: exist2?.id_chat });
    }

    console.error('💥 chat:get_or_create Error general:', e);
    return ack && ack({ ok: false, error: 'Error al crear/obtener chat' });
  }
});

//////////////////////////// ENVIAR MENSAJE ///////////////////////////////////////
// ===== Idempotencia + ACK (sin client_id en BD) =====
socket.on('message:send', async (payload = {}, ack) => {
  console.log(`🟣 message:send recibido → userId=${userId}`, payload);

  try {
    const { chatId, to, body } = payload;
    let { client_id } = payload;
    const chatIdNum = Number(chatId);
    const toNum = Number(to);

    // Validación inicial
    if (!chatIdNum || !toNum || !body || String(body).trim() === '') {
      console.log('❌ message:send → faltan campos requeridos');
      return ack && ack({ ok: false, error: 'chatId, to y body son requeridos' });
    }

    // Validar pertenencia del usuario al chat
    const [[c]] = await pool.query(
      `SELECT id_chat
         FROM Chats
        WHERE id_chat = ?
          AND (id_usuario1 = ? OR id_usuario2 = ?)
        LIMIT 1`,
      [chatIdNum, userId, userId]
    );

    if (!c) {
      console.log(`⚠️ message:send → userId=${userId} no pertenece al chat ${chatIdNum}`);
      return ack && ack({ ok: false, error: 'No perteneces al chat' });
    }

    // Generar o mantener client_id (para cache en memoria)
    client_id = client_id || randomUUID();

    // Comprobar cache de idempotencia
    const cached = getIdemp(chatIdNum, client_id);
    if (cached) {
      console.log(`♻️ message:send → mensaje duplicado detectado, usando cache client_id=${client_id}`);
      io.to(`chat:${chatIdNum}`).emit('message:new', cached);
      return ack && ack({ ok: true, message: cached, dedup: true, client_id });
    }

    // Insertar mensaje
    const [ins] = await pool.query(
      `INSERT INTO Mensajes (id_chat, id_usuariotx, id_usuariorx, mensaje)
       VALUES (?, ?, ?, ?)`,
      [chatIdNum, userId, toNum, String(body).trim()]
    );
    console.log(`📝 message:send → mensaje insertado id=${ins.insertId} chat=${chatIdNum}`);

    // Obtener mensaje recién insertado
    const [[msg]] = await pool.query(
      `SELECT * FROM Mensajes WHERE id_mensaje = ? LIMIT 1`,
      [ins.insertId]
    );

    // Guardar en cache e informar a los miembros del chat
    setIdemp(chatIdNum, client_id, { ...msg, client_id });  // cachea también el client_id
    io.to(`chat:${chatIdNum}`).emit('message:new', { ...msg, client_id }); // ← añade client_id
    return ack && ack({ ok: true, message: { ...msg, client_id }, client_id });

    return ack && ack({ ok: true, message: msg, client_id });

  } catch (e) {
    console.error(`💥 message:send Error → userId=${userId}`, e);
    return ack && ack({ ok: false, error: 'Error al enviar' });
  }
});

//////////////////// DESCONECTARSE ////////////////////////////
    socket.on('disconnect', () => {
       console.log(`🔴 Usuario desconectado: ${socket.userId}`);
    });
  });
};
