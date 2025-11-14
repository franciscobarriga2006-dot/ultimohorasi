const pool = require('../db');
const t = (s) => (typeof s === 'string' ? s.trim() : s);

const createPerfil = async (req, res) => {
  try {
    const {
      id_usuario,                  // requerido
      habilidades = '',
      experiencia = '',
      disponibilidad_horaria = null, // objeto o null
      insignia = null,             // 0..5 o null
      ciudad = null,
      region = null,
    } = req.body || {};

    const uid = Number(id_usuario);
    if (!uid) return res.status(400).json({ error: 'id_usuario requerido' });

    if (insignia != null) {
      const n = Number(insignia);
      if (Number.isNaN(n) || n < 0 || n > 5) {
        return res.status(400).json({ error: 'insignia debe estar entre 0 y 5' });
      }
    }

    // única fila por usuario
    const [[exist]] = await pool.query(
      'SELECT 1 FROM Perfiles WHERE id_usuario = ? LIMIT 1',
      [uid]
    );
    if (exist) return res.status(409).json({ error: 'Perfil ya existe' });

    // Inserción
    await pool.query(
      `INSERT INTO Perfiles
        (id_usuario, habilidades, experiencia, disponibilidad_horaria, insignia, ciudad, region, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
      [
        uid,
        t(habilidades),
        t(experiencia),
        disponibilidad_horaria ? JSON.stringify(disponibilidad_horaria) : null,
        insignia == null ? null : Number(insignia),
        t(ciudad),
        t(region),
      ]
    );

    // Devolver perfil creado con join a Usuarios
    const [[row]] = await pool.query(
      `SELECT p.*, u.nombres, u.apellidos, u.correo, u.Rol
         FROM Perfiles p
         JOIN Usuarios u ON u.id_usuario = p.id_usuario
        WHERE p.id_usuario = ? LIMIT 1`,
      [uid]
    );

    return res.status(201).json(row);
  } catch (err) {
    console.error('createPerfil error:', err);
    return res.status(500).json({ error: 'Error al crear perfil' });
  }
};


// GET /perfil/:id
const getPerfil = async (req, res) => {
  try {
    const raw = String(req.params.id ?? "");
    let id = Number(raw);

    // Fallback a sesión cuando no hay id válido o usan "me"/"mine"
    if (!Number.isFinite(id) || id <= 0 || raw === "me" || raw === "mine") {
      const headerId = Number(req.headers['x-user-id'] || 0);
      const cookieId = Number(req.cookies?.uid || 0);
      id = headerId || cookieId || 0;
    }

    if (!id) return res.status(400).json({ error: 'id inválido o sin sesión' });

    const sql = `
      SELECT 
        p.*,
        u.Rut        AS rut,
        u.nombres,
        u.apellidos,
        u.correo,
        u.Rol,
        CASE 
          WHEN u.contrasena IS NULL OR u.contrasena = '' THEN 0
          ELSE 1
        END          AS has_password
      FROM Perfiles p
      JOIN Usuarios u ON u.id_usuario = p.id_usuario
      WHERE p.id_usuario = ? 
      LIMIT 1
    `;
    const [[row]] = await pool.query(sql, [id]);
    if (!row) return res.status(404).json({ error: 'Perfil no encontrado' });

    // No enviar hash si llegara a venir
    if ('contrasena' in row) delete row.contrasena;

    res.json(row);
  } catch (err) {
    console.error('getPerfil error:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// PATCH /perfil/:id  (editar propio perfil)
const patchPerfil = async (req, res) => {
  try {
    const authId = Number(req.header('x-user-id') || 0);
    if (!authId) return res.status(400).json({ error: 'x-user-id requerido' });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    if (authId !== id) return res.status(403).json({ error: 'Solo puedes editar tu propio perfil' });

    // asegurar que exista perfil (ONE-TO-ONE)
    const [[exist]] = await pool.query(
      'SELECT id_perfil FROM Perfiles WHERE id_usuario = ? LIMIT 1',
      [id]
    );
    if (!exist) return res.status(404).json({ error: 'Perfil no encontrado' });

    const allowed = [
      'habilidades',
      'experiencia',
      'disponibilidad_horaria',
      'insignia',
      'ciudad',
      'region',
    ];

    const sets = [];
    const params = [];

    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        let v = req.body[k];
        if (k === 'insignia' && v != null) {
          const n = Number(v);
          if (Number.isNaN(n) || n < 0 || n > 5) {
            return res.status(400).json({ error: 'insignia debe estar entre 0 y 5' });
          }
          v = n;
        } else if (typeof v === 'string') {
          v = t(v);
        }
        sets.push(`${k} = ?`);
        params.push(v);
      }
    }

    if (!sets.length) return res.status(400).json({ error: 'Nada para actualizar' });

    await pool.query(
      `UPDATE Perfiles 
          SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP(3)
        WHERE id_usuario = ?`,
      [...params, id]
    );

    // devolver perfil actualizado
    const [[out]] = await pool.query(
      `SELECT p.*, u.nombres, u.apellidos, u.correo, u.Rol
         FROM Perfiles p
         JOIN Usuarios u ON u.id_usuario = p.id_usuario
        WHERE p.id_usuario = ? LIMIT 1`,
      [id]
    );
    res.json(out);
  } catch (err) {
    console.error('patchPerfil error:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const patchUsuarioDatos = async (req, res) => {
  try {
    // resolver id: param o sesión
    const raw = String(req.params.id ?? "");
    let id = Number(raw);
    if (!Number.isFinite(id) || id <= 0 || raw === 'me' || raw === 'mine') {
      const headerId = Number(req.headers['x-user-id'] || 0);
      const cookieId = Number(req.cookies?.uid || 0);
      id = headerId || cookieId || 0;
    }
    if (!id) return res.status(400).json({ error: 'id inválido o sin sesión' });

    // solo campos permitidos
    const allow = ['Rut','nombres','apellidos','correo'];
    const sets = [];
    const params = [];

    for (const k of allow) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        let v = req.body[k];
        if (typeof v === 'string') v = t(v);
        if (k === 'correo') {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
          if (!ok) return res.status(400).json({ error: 'correo inválido' });
        }
        if (k === 'Rut' && (!v || String(v).length > 25)) {
          return res.status(400).json({ error: 'Rut inválido' });
        }
        if (k === 'nombres' && !v) return res.status(400).json({ error: 'nombres requerido' });
        if (k === 'apellidos' && !v) return res.status(400).json({ error: 'apellidos requerido' });

        sets.push(`${k} = ?`);
        params.push(v);
      }
    }
    if (!sets.length) return res.status(400).json({ error: 'Nada para actualizar' });

    // autorizar: solo puede editarse a sí mismo
    const [[own]] = await pool.query('SELECT id_usuario FROM Usuarios WHERE id_usuario = ? LIMIT 1', [id]);
    if (!own) return res.status(404).json({ error: 'Usuario no encontrado' });

    await pool.query(`UPDATE Usuarios SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id_usuario = ?`, [...params, id]);

    // devolver el mismo DTO del GET
    const sql = `
      SELECT 
        p.*,
        u.Rut AS rut,
        u.nombres,
        u.apellidos,
        u.correo,
        u.Rol,
        CASE WHEN u.contrasena IS NULL OR u.contrasena = '' THEN 0 ELSE 1 END AS has_password
      FROM Perfiles p
      JOIN Usuarios u ON u.id_usuario = p.id_usuario
      WHERE p.id_usuario = ? LIMIT 1
    `;
    const [[row]] = await pool.query(sql, [id]);
    if (!row) return res.status(404).json({ error: 'Perfil no encontrado tras actualizar' });
    res.json(row);
  } catch (err) {
    // duplicado de correo u otro índice único
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Correo ya registrado' });
    console.error('patchUsuarioDatos error:', err);
    res.status(500).json({ error: 'Error al actualizar datos personales' });
  }
};

module.exports = { getPerfil, patchPerfil, createPerfil, patchUsuarioDatos };