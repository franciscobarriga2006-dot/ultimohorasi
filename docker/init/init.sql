-- Ajustes globales recomendados
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


CREATE DATABASE IF NOT EXISTS jobmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobmatch;

-- 1) USUARIOS
CREATE TABLE IF NOT EXISTS Usuarios (
  id_usuario      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Rut             VARCHAR(25) NOT NULL,
  nombres         VARCHAR(200) NOT NULL,
  apellidos       VARCHAR(200) NOT NULL,
  correo          VARCHAR(191) NOT NULL,
  contrasena      VARCHAR(255) NOT NULL, -- evitar 'ñ' en nombre de columna
  estado          TINYINT(1) NOT NULL DEFAULT 1,
  Rol             ENUM('admin','empleador','trabajador') NOT NULL DEFAULT 'trabajador',
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_usuarios PRIMARY KEY (id_usuario),
  CONSTRAINT uq_usuarios_rut UNIQUE (Rut),
  CONSTRAINT uq_usuarios_correo UNIQUE (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) PERFILES
CREATE TABLE IF NOT EXISTS Perfiles (
  id_perfil               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario              BIGINT UNSIGNED NOT NULL,
  habilidades             TEXT,
  experiencia             TEXT,
  disponibilidad_horaria  VARCHAR(200),
  insignia                DECIMAL(3,1), -- ej. 4.5
  ciudad                  VARCHAR(100),
  region                  VARCHAR(100),
  created_at              DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_perfiles PRIMARY KEY (id_perfil),
  CONSTRAINT uq_perfiles_usuario UNIQUE (id_usuario),
  CONSTRAINT fk_perfiles_usuario FOREIGN KEY (id_usuario)
    REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) PUBLICACIONES
CREATE TABLE IF NOT EXISTS Publicaciones (
  id_publicacion       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario           BIGINT UNSIGNED NOT NULL,  -- autor
  titulo               VARCHAR(200) NOT NULL,
  descripcion          TEXT NOT NULL,
  direccion            VARCHAR(100),
  horario              VARCHAR(100),
  tipo                 VARCHAR(50),
  monto                DECIMAL(10,2),
  horas                VARCHAR(50),
  estado               ENUM('activa','pausada','cerrada','eliminada') NOT NULL DEFAULT 'activa',
  ciudad               VARCHAR(100),
  region               VARCHAR(100),
  created_at           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_publicaciones PRIMARY KEY (id_publicacion),
  CONSTRAINT fk_publicaciones_autor FOREIGN KEY (id_usuario)
    REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_pub_autor (id_usuario),
  INDEX idx_pub_estado (estado),
  INDEX idx_pub_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) ETIQUETAS (catálogo)
CREATE TABLE IF NOT EXISTS Etiquetas (
  id_etiqueta  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(100) NOT NULL,
  CONSTRAINT pk_etiquetas PRIMARY KEY (id_etiqueta),
  CONSTRAINT uq_etiquetas_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) ETIQUETAS_PUBLICACIONES (N:M)
CREATE TABLE IF NOT EXISTS Etiquetas_publicaciones (
  id_etiqueta     BIGINT UNSIGNED NOT NULL,
  id_publicacion  BIGINT UNSIGNED NOT NULL,
  CONSTRAINT pk_etiquetas_publicaciones PRIMARY KEY (id_etiqueta, id_publicacion),
  CONSTRAINT fk_ep_etiqueta FOREIGN KEY (id_etiqueta)
    REFERENCES Etiquetas(id_etiqueta) ON DELETE CASCADE,
  CONSTRAINT fk_ep_publicacion FOREIGN KEY (id_publicacion)
    REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
  INDEX idx_ep_publicacion (id_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) LISTA_BLOQUEOS (usuario bloquea a usuario)
CREATE TABLE IF NOT EXISTS Lista_bloqueos (
  id_usuario    BIGINT UNSIGNED NOT NULL,
  id_bloqueado  BIGINT UNSIGNED NOT NULL,
  fecha         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_lista_bloqueos PRIMARY KEY (id_usuario, id_bloqueado),
  CONSTRAINT fk_bloqueos_user FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_bloqueos_blocked FOREIGN KEY (id_bloqueado) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT ck_bloqueos_distintos CHECK (id_usuario <> id_bloqueado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7) POSTULACIONES
CREATE TABLE IF NOT EXISTS Postulaciones (
  id_postulacion       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_publicacion       BIGINT UNSIGNED NOT NULL,
  id_postulante        BIGINT UNSIGNED NOT NULL,
  mensaje              TEXT,
  estado_postulacion   ENUM('pendiente','aceptada','rechazada') NOT NULL DEFAULT 'pendiente',
  fecha                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_postulaciones PRIMARY KEY (id_postulacion),
  CONSTRAINT uq_postulacion_unica UNIQUE (id_publicacion, id_postulante),
  CONSTRAINT fk_post_pub FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
  CONSTRAINT fk_post_user FOREIGN KEY (id_postulante) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_post_estado (estado_postulacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8) HISTORIAL_TRABAJOS (relación tras aceptación)
CREATE TABLE IF NOT EXISTS Historial_trabajos (
  id_historial   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_publicacion BIGINT UNSIGNED NOT NULL,
  id_empleador   BIGINT UNSIGNED NOT NULL,
  id_empleado    BIGINT UNSIGNED NOT NULL,
  fecha          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_historial PRIMARY KEY (id_historial),
  CONSTRAINT uq_historial_rel UNIQUE (id_publicacion, id_empleador, id_empleado),
  CONSTRAINT fk_hist_pub FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
  CONSTRAINT fk_hist_emp1 FOREIGN KEY (id_empleador) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_hist_emp2 FOREIGN KEY (id_empleado)  REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT ck_hist_distintos CHECK (id_empleador <> id_empleado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9) CHATS (par ordenado; forzamos id_usuario1 < id_usuario2 para UNIQUE)
CREATE TABLE IF NOT EXISTS Chats (
  id_chat      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario1  BIGINT UNSIGNED NOT NULL,
  id_usuario2  BIGINT UNSIGNED NOT NULL,
  fecha        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_chats PRIMARY KEY (id_chat),
  CONSTRAINT ck_chats_orden CHECK (id_usuario1 < id_usuario2),
  CONSTRAINT uq_chats_par UNIQUE (id_usuario1, id_usuario2),
  CONSTRAINT fk_chats_u1 FOREIGN KEY (id_usuario1) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_chats_u2 FOREIGN KEY (id_usuario2) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10) MENSAJES
CREATE TABLE IF NOT EXISTS Mensajes (
  id_mensaje     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_chat        BIGINT UNSIGNED NOT NULL,
  id_usuariotx   BIGINT UNSIGNED NOT NULL,
  id_usuariorx   BIGINT UNSIGNED NOT NULL,
  mensaje        TEXT NOT NULL,
  fecha          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_mensajes PRIMARY KEY (id_mensaje),
  CONSTRAINT fk_msg_chat FOREIGN KEY (id_chat) REFERENCES Chats(id_chat) ON DELETE CASCADE,
  CONSTRAINT fk_msg_tx   FOREIGN KEY (id_usuariotx) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_msg_rx   FOREIGN KEY (id_usuariorx) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11) CALIFICACIONES (1 por trabajo)
CREATE TABLE IF NOT EXISTS Calificaciones (
  id_calificacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario      BIGINT UNSIGNED NOT NULL, -- calificador
  id_calificado   BIGINT UNSIGNED NOT NULL, -- a quién califico
  id_historial    BIGINT UNSIGNED NOT NULL,
  puntuacion      TINYINT UNSIGNED NOT NULL,
  comentario      TEXT,
  fecha           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_calificaciones PRIMARY KEY (id_calificacion),
  CONSTRAINT ck_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
  CONSTRAINT uq_cal_unica UNIQUE (id_usuario, id_calificado, id_historial),
  CONSTRAINT fk_cal_hist FOREIGN KEY (id_historial) REFERENCES Historial_trabajos(id_historial) ON DELETE CASCADE,
  CONSTRAINT fk_cal_from FOREIGN KEY (id_usuario)   REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_cal_to   FOREIGN KEY (id_calificado)REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12) NOTIFICACIONES
CREATE TABLE IF NOT EXISTS Notificaciones (
  id_notificacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario      BIGINT UNSIGNED NOT NULL,
  titulo          VARCHAR(100) NOT NULL,
  mensaje         TEXT,
  fecha           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_notificaciones PRIMARY KEY (id_notificacion),
  CONSTRAINT fk_notif_user FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_notif_user_fecha (id_usuario, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13) INTERACCIONES
CREATE TABLE IF NOT EXISTS Interacciones (
  id_interaccion    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario        BIGINT UNSIGNED NOT NULL,
  id_publicacion    BIGINT UNSIGNED NOT NULL,
  fecha             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  tipo_interaccion  ENUM('vista','guardar','postulacion') NOT NULL,
  CONSTRAINT pk_interacciones PRIMARY KEY (id_interaccion),
  CONSTRAINT fk_int_user FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_int_pub  FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
  INDEX idx_int_pub_tipo (id_publicacion, tipo_interaccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14) FOROS
CREATE TABLE IF NOT EXISTS Foros (
  id_foro     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario  BIGINT UNSIGNED NOT NULL,
  titulo      VARCHAR(100) NOT NULL,
  fecha       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  consulta    TEXT NOT NULL,
  CONSTRAINT pk_foros PRIMARY KEY (id_foro),
  CONSTRAINT fk_foros_user FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_foros_user_fecha (id_usuario, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15) RESPUESTAS_FOROS
CREATE TABLE IF NOT EXISTS Respuestas_foros (
  id_respuesta  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_foro       BIGINT UNSIGNED NOT NULL,
  id_usuario    BIGINT UNSIGNED NOT NULL,
  respuesta     TEXT NOT NULL,
  fecha         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_respuestas PRIMARY KEY (id_respuesta),
  CONSTRAINT fk_resp_foro  FOREIGN KEY (id_foro) REFERENCES Foros(id_foro) ON DELETE CASCADE,
  CONSTRAINT fk_resp_user  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_resp_foro_fecha (id_foro, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16) REPORTES
CREATE TABLE IF NOT EXISTS Reportes (
  id_reporte             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario_reportador  BIGINT UNSIGNED NOT NULL,
  id_usuario_reportado   BIGINT UNSIGNED NOT NULL,
  id_publicacion         BIGINT UNSIGNED NULL,
  descripcion            TEXT NOT NULL,
  fecha                  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_reportes PRIMARY KEY (id_reporte),
  CONSTRAINT fk_rep_reportador FOREIGN KEY (id_usuario_reportador) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_rep_reportado  FOREIGN KEY (id_usuario_reportado)  REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_rep_pub        FOREIGN KEY (id_publicacion)        REFERENCES Publicaciones(id_publicacion) ON DELETE SET NULL,
  CONSTRAINT ck_rep_distintos CHECK (id_usuario_reportador <> id_usuario_reportado),
  INDEX idx_rep_pub (id_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17) GUARDADOS (favoritos)
CREATE TABLE IF NOT EXISTS Guardados (
  id_guardado    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario     BIGINT UNSIGNED NOT NULL,
  id_publicacion BIGINT UNSIGNED NOT NULL,  fecha          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_guardados PRIMARY KEY (id_guardado),
  CONSTRAINT uq_guardado_unico UNIQUE (id_usuario, id_publicacion),
  CONSTRAINT fk_guard_user FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_guard_pub  FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
  INDEX idx_guard_user_fecha (id_usuario, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



--------------------- poblar tablas ---------------------

-- USE appdb;

-- ========= USUARIOS =========
INSERT INTO Usuarios (id_usuario, Rut, nombres, apellidos, correo, contrasena, estado, Rol)
VALUES
(1,'11.111.111-1','Ana','Pérez','ana@example.com','pass1',1,'empleador'),
(2,'22.222.222-2','Benjamín','Rojas','benja@example.com','pass2',1,'empleador'),
(3,'33.333.333-3','Rigoberto','Guzmán','rigo@example.com','pass3',1,'empleador'),
(4,'44.444.444-4','Ignacio','Campos','ignacio@example.com','pass4',1,'trabajador'),
(5,'55.555.555-5','Camila','Muñoz','camila@example.com','pass5',1,'trabajador'),
(6,'66.666.666-6','Diego','Soto','diego@example.com','pass6',1,'trabajador'),
(7,'77.777.777-7','María','Lagos','maria@example.com','pass7',1,'trabajador'),
(8,'88.888.888-8','Tomás','Vargas','tomas@example.com','pass8',1,'admin');

-- ========= PERFILES =========
INSERT INTO Perfiles (id_perfil, id_usuario, habilidades, experiencia, disponibilidad_horaria, insignia, ciudad, region)
VALUES
(1,1,'Logística, Liderazgo','5 años en retail','Lun–Vie 9–18',4.5,'Santiago','RM'),
(2,2,'Soporte TI, Redes','3 años soporte','Turnos',4.0,'Temuco','Araucanía'),
(3,3,'Construcción, Pintura','8 años obras','Proyecto',4.2,'Valdivia','Los Ríos'),
(4,4,'Frontend, RN','Freelance','Tardes',4.8,'Temuco','Araucanía'),
(5,5,'Atención cliente','2 años ventas','Fin de semana',4.1,'Santiago','RM'),
(6,6,'Electricidad básica','1 año mantención','Mañanas',3.9,'Temuco','Araucanía'),
(7,7,'Diseño gráfico','4 años','Flexible',4.6,'Valdivia','Los Ríos'),
(8,8,'Administración','10 años','Oficina',4.7,'Santiago','RM');

-- ========= ETIQUETAS =========
INSERT INTO Etiquetas (id_etiqueta, nombre) VALUES
(1,'ventas'),(2,'aseo'),(3,'construccion'),(4,'soporte'),
(5,'diseño'),(6,'eventual'),(7,'medio_tiempo'),(8,'remoto');

-- ========= PUBLICACIONES =========
INSERT INTO Publicaciones (id_publicacion, id_usuario, titulo, descripcion, direccion, horario, tipo, monto, horas, estado, ciudad, region)
VALUES
(1,1,'Ayudante de bodega','Apoyo en carga/descarga, inventario.','Av. Central 123','Lun–Vie 9–18','presencial',35000,'8','activa','Santiago','RM'),
(2,2,'Soporte PC a domicilio','Formateo, limpieza, antivirus.','—','Flex','remoto',20000,'por servicio','activa','Temuco','Araucanía'),
(3,3,'Pintor interior','Pintura depto 60m2.','Calle Norte 456','L–S 10–18','presencial',50000,'8','activa','Valdivia','Los Ríos'),
(4,1,'Reposición nocturna','Reposición y orden góndolas.','Av. Sur 789','Nocturno','presencial',42000,'8','pausada','Santiago','RM'),
(5,2,'Técnico redes','Instalación de cableado estructurado.','—','Proyecto','mixto',60000,'por día','activa','Temuco','Araucanía'),
(6,3,'Maestro yesero','Terminaciones interiores.','Pasaje 12','L–V','presencial',55000,'8','cerrada','Valdivia','Los Ríos');

-- ========= N:M ETIQUETAS_PUBLICACIONES =========
INSERT INTO Etiquetas_publicaciones (id_etiqueta, id_publicacion) VALUES
(1,1),(6,1),
(4,2),(8,2),
(3,3),(6,3),
(1,4),(2,4),
(4,5),(7,5),
(3,6);

-- ========= BLOQUEOS =========
INSERT INTO Lista_bloqueos (id_usuario, id_bloqueado) VALUES
(5,2),  -- Camila bloquea a Benjamín
(2,5);  -- bloque mutuo para probar lógica

-- ========= POSTULACIONES =========
INSERT INTO Postulaciones (id_postulacion, id_publicacion, id_postulante, mensaje, estado_postulacion)
VALUES
(1,1,4,'Tengo experiencia en bodega.','aceptada'),
(2,1,5,'Puedo en horario nocturno.','rechazada'),
(3,2,6,'Dispongo de herramientas.','pendiente'),
(4,3,7,'Trabajo prolijo, portafolio disponible.','pendiente'),
(5,5,4,'Experiencia en redes UTP.','pendiente');

-- ========= HISTORIAL (por postulación aceptada) =========
-- Publicación 1 es del usuario 1 (empleador). Postulación aceptada del usuario 4 (empleado).
INSERT INTO Historial_trabajos (id_historial, id_publicacion, id_empleador, id_empleado)
VALUES
(1,1,1,4);

-- ========= CHATS (id_usuario1 < id_usuario2) =========
INSERT INTO Chats (id_chat, id_usuario1, id_usuario2)
VALUES
(1,1,4),  -- empleador 1 con trabajador 4
(2,2,5),  -- 2 con 5
(3,3,7);  -- 3 con 7

-- ========= MENSAJES =========
INSERT INTO Mensajes (id_mensaje, id_chat, id_usuariotx, id_usuariorx, mensaje)
VALUES
(1,1,1,4,'Hola Ignacio, ¿puedes venir mañana a las 9?'),
(2,1,4,1,'Sí, confirmo asistencia.'),
(3,2,2,5,'¿Sigues interesado en el puesto de redes?');

-- ========= CALIFICACIONES (por historial 1) =========
-- califica empleador→empleado y empleado→empleador
INSERT INTO Calificaciones (id_calificacion, id_usuario, id_calificado, id_historial, puntuacion, comentario)
VALUES
(1,1,4,1,5,'Responsable y puntual.'),
(2,4,1,1,5,'Trato excelente, pago al día.');

-- ========= NOTIFICACIONES =========
INSERT INTO Notificaciones (id_notificacion, id_usuario, titulo, mensaje)
VALUES
(1,4,'Postulación aceptada','Tu postulación a "Ayudante de bodega" fue aceptada.'),
(2,5,'Postulación rechazada','Tu postulación a "Ayudante de bodega" fue rechazada.'),
(3,6,'Nuevo mensaje','Tienes un mensaje nuevo en el chat.');

-- ========= INTERACCIONES =========
INSERT INTO Interacciones (id_interaccion, id_usuario, id_publicacion, tipo_interaccion)
VALUES
(1,4,1,'vista'),
(2,4,1,'postulacion'),
(3,5,1,'vista'),
(4,6,2,'vista'),
(5,7,3,'guardar');

-- ========= FOROS =========
INSERT INTO Foros (id_foro, id_usuario, titulo, consulta)
VALUES
(1,4,'¿Consejos para primera entrevista?','¿Qué recomiendan llevar?'),
(2,2,'Pago por día vs hora','¿Qué conviene para trabajos eventuales?');

-- ========= RESPUESTAS_FOROS =========
INSERT INTO Respuestas_foros (id_respuesta, id_foro, id_usuario, respuesta)
VALUES
(1,1,1,'Llega 10 minutos antes y lleva tu CV.'),
(2,2,7,'Depende del tipo de tarea, por día suele ser mejor.');

-- ========= REPORTES =========
INSERT INTO Reportes (id_reporte, id_usuario_reportador, id_usuario_reportado, id_publicacion, descripcion)
VALUES
(1,7,3,3,'Publicación con información incompleta.');

-- ========= GUARDADOS (favoritos) =========
INSERT INTO Guardados (id_guardado, id_usuario, id_publicacion)
VALUES
(1,4,2),
(2,5,3),
(3,6,5);
