// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// Rutas
const indexroutes = require('./routes/index.routes.js');
const publicacionesRoutes = require('./routes/publicaciones.routes.js');
const postulacionesRoutes = require('./routes/postulaciones.routes.js');
const chatsRoutes = require('./routes/chats.routes.js');
const calificacionesRoutes = require('./routes/calificaciones.routes.js');
const authroutes = require('./routes/auth.routes.js');
const mensajesRoutes = require('./routes/mensajes.routes.js');
const notificacionesRoutes = require('./routes/notificaciones.routes.js');
const forosRoutes = require('./routes/foros.routes.js');
const respuestasRoutes = require('./routes/respuestas.routes.js');
const perfilesRoutes = require('./routes/perfiles.routes.js');
const app = express();

// CORS: credenciales + origen explícito
const ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);           // permite tools sin Origin
    if (ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-user-id'],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Montar rutas API (sin cambios)
app.use(indexroutes);
app.use(publicacionesRoutes);
app.use(postulacionesRoutes);
app.use(chatsRoutes);
app.use(calificacionesRoutes);
app.use(authroutes);
app.use(mensajesRoutes);
app.use(perfilesRoutes);
app.use(notificacionesRoutes);
app.use(respuestasRoutes);
app.use(forosRoutes);

app.post('/auth/logout', (req, res) => {
  res.clearCookie('dev_auth', { path: '/' });
  res.clearCookie('uid', { path: '/' });
  return res.status(204).end();
});

// HTTP + Socket.IO
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ORIGINS, credentials: true, methods: ['GET','POST'] },
});

app.locals.io = io;
require('./socket/chat.socket.js')(io);

// Arrancar servidor
const port = Number(process.env.PORT || 3001);
server.listen(port, () => {
  console.log(`API + Socket.IO en http://localhost:${port}`);
});
