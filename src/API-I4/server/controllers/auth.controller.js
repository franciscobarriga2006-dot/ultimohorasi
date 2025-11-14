const pool = require('../db');
const t = (s) => (typeof s === 'string' ? s.trim() : s);
const TTL_MS = 30 * 60 * 1000;


const register = async (req, res) => {
  try {
    const { correo, contrasena, nombres = null, apellidos = null, Rut = null, Rol = 'trabajador' } = req.body || {};
    if (!correo || !contrasena) return res.status(400).json({ error: 'correo y contrasena son obligatorios' });

    // revisar si ya fue creado un usuario con ese correo
    const [ex] = await pool.query('SELECT id_usuario FROM `Usuarios` WHERE `correo` = ? LIMIT 1', [t(correo)]);
    if (ex.length) return res.status(409).json({ error: 'El correo ya está registrado' });

    // revisar si ya fue creado un usuario con ese rut
    if (Rut) {
      const [exRut] = await pool.query('SELECT id_usuario FROM `Usuarios` WHERE `Rut` = ? LIMIT 1', [t(Rut)]);
      if (exRut.length) return res.status(409).json({ error: 'El Rut ya está registrado' });
    }

    const [result] = await pool.query(
      `INSERT INTO \`Usuarios\`
       (\`Rut\`, \`nombres\`, \`apellidos\`, \`correo\`, \`contrasena\`, \`estado\`, \`Rol\`)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [t(Rut), t(nombres), t(apellidos), t(correo), t(contrasena), Rol]
    );

    const id = result.insertId;
    return res.status(201).json({
      user: { id_usuario: id, correo: t(correo), nombres: t(nombres), apellidos: t(apellidos), Rol },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Error en registro' });
  }
};
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body || {};
    if (!correo || !contrasena) return res.status(400).json({ error: 'correo y contrasena son obligatorios' });

    const [rows] = await pool.query(
      `SELECT id_usuario, correo, contrasena, nombres, apellidos, Rol, estado
       FROM \`Usuarios\` WHERE \`correo\` = ? LIMIT 1`,
      [t(correo)]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

    const u = rows[0];

    if (!u.estado) return res.status(403).json({ error: 'Usuario inactivo/bloqueado' });

    if (t(contrasena) !== t(u.contrasena)) return res.status(401).json({ error: 'Credenciales inválidas' });
    res.cookie('dev_auth', '1', {
      httpOnly: false,   // solo para DEV
      sameSite: 'lax',
      secure: false,
      maxAge: TTL_MS,                               // expira en 30 min
      expires: new Date(Date.now() + TTL_MS),
    });
    res.cookie('uid', String(u.id_usuario), {
      httpOnly: true, sameSite: 'lax', secure: false, // true en prod + secure
      maxAge: TTL_MS, expires: new Date(Date.now() + TTL_MS), path: '/',
    });
    // sin token: devuelve datos del usuario
    return res.json({
      user: {
        id_usuario: u.id_usuario,
        correo: u.correo,
        nombres: u.nombres,
        apellidos: u.apellidos,
        Rol: u.Rol,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Error en login' });
  }
};

module.exports = { login, register };