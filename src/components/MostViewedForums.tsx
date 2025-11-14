"use client";

// ============= TYPES =============
type NullableDate = string | number | Date | null | undefined;

type UsuarioLigero = {
  id_usuario?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
  correo?: string | null;
};

type ResumenRespuesta = {
  total?: number | null;
  ultimaRespuesta?: NullableDate;
  ultimoUsuario?: UsuarioLigero | null;
};

export type DashboardForum = {
  id_foro: number;
  id_usuario: number;
  titulo: string;
  consulta: string;
  fecha: NullableDate;
  vistas?: number | null; // Campo adicional - agregar a la BD si quieres usar "Más Vistos"
  usuario?: UsuarioLigero | null;
  respuestas?: ResumenRespuesta | null;
};

// ============= UTILITIES =============
const formatDateTime = (value: NullableDate) => {
  if (value == null) return "—";
  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
      ? new Date(value)
      : typeof value === "string"
      ? new Date(value)
      : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getUsuarioNombre = (
  usuario: UsuarioLigero | null | undefined,
  fallbackId?: number
) => {
  if (!usuario) return fallbackId ? `Usuario #${fallbackId}` : "—";
  const partes = [usuario.nombres, usuario.apellidos].filter(Boolean);
  if (partes.length) return partes.join(" ");
  if (usuario.correo) return usuario.correo;
  if (usuario.id_usuario) return `Usuario #${usuario.id_usuario}`;
  if (fallbackId) return `Usuario #${fallbackId}`;
  return "—";
};

// ============= FORUM CARD COMPONENT =============
import { motion } from "framer-motion";
import { fadeInUp } from "@/components/animations";

function ForumCard({ forum }: { forum: DashboardForum }) {
  const respuestasTotales = forum.respuestas?.total ?? null;
  const hasRespuestas =
    typeof respuestasTotales === "number" && respuestasTotales > 0;

  return (
    <motion.article
      className="group relative h-full rounded-2xl bg-gradient-to-tr from-amber-500/25 via-orange-500/25 to-red-500/25 p-[1px]"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <header className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                #{forum.id_foro}
              </span>
              Foro
            </span>
            <div className="flex gap-2">
              {typeof forum.vistas === "number" && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-600 ring-1 ring-amber-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="font-bold">{forum.vistas.toLocaleString()}</span>
                </div>
              )}
              {typeof respuestasTotales === "number" && (
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-600 text-xs">
                    {Math.max(0, respuestasTotales)}
                  </span>
                  <span className="font-medium">resp.</span>
                </div>
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold leading-snug text-slate-900">
            {forum.titulo}
          </h3>
        </header>

        <p className="text-sm text-slate-700 line-clamp-3">{forum.consulta}</p>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Creado por
            </dt>
            <dd className="mt-1 font-medium text-slate-800">
              {getUsuarioNombre(forum.usuario, forum.id_usuario)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Fecha de creación
            </dt>
            <dd className="mt-1 font-medium text-slate-800">
              {formatDateTime(forum.fecha)}
            </dd>
          </div>
          {hasRespuestas && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Última respuesta
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatDateTime(forum.respuestas?.ultimaRespuesta)}
              </dd>
            </div>
          )}
          {hasRespuestas && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Respondió por última vez
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {getUsuarioNombre(
                  forum.respuestas?.ultimoUsuario,
                  forum.id_usuario
                )}
              </dd>
            </div>
          )}
        </dl>

        <footer className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-500">
            ID usuario: #{forum.id_usuario}
          </span>
          <motion.button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            Ver detalles
          </motion.button>
        </footer>
      </div>
    </motion.article>
  );
}

// ============= MOST VIEWED FORUMS COMPONENT =============
export default function MostViewedForums() {
  // Datos mock temporales
    const forums: DashboardForum[] = [
    {
        id_foro: 201,
        id_usuario: 3,
        titulo: "¿Cuál es la mejor forma de cobrar por trabajos ocasionales?",
        consulta:
        "He estado haciendo trabajos informales de jardinería y limpieza. ¿Cobran por hora o por tarea? ¿Qué les funciona mejor?",
        fecha: new Date(2025, 9, 20, 10, 0),
        vistas: 1420,
        usuario: {
        id_usuario: 3,
        nombres: "Valentina",
        apellidos: "Rojas",
        },
        respuestas: {
        total: 12,
        ultimaRespuesta: new Date(2025, 9, 29, 18, 20),
        ultimoUsuario: {
            id_usuario: 22,
            nombres: "Sofía",
            apellidos: "Paredes",
        },
        },
    },
    {
        id_foro: 202,
        id_usuario: 8,
        titulo: "Experiencias dando clases particulares sin ser profesional",
        consulta:
        "Algunos de ustedes dan clases de apoyo escolar sin tener título profesional. ¿Cómo consiguen alumnos y cuánto cobran?",
        fecha: new Date(2025, 9, 18, 15, 45),
        vistas: 1785,
        usuario: {
        id_usuario: 8,
        nombres: "Andrés",
        apellidos: "Vega",
        },
        respuestas: {
        total: 20,
        ultimaRespuesta: new Date(2025, 9, 29, 11, 10),
        ultimoUsuario: {
            id_usuario: 31,
            nombres: "Luis",
            apellidos: "González",
        },
        },
    },
    {
        id_foro: 203,
        id_usuario: 14,
        titulo: "Consejos para organizar tu tiempo si haces varios trabajos informales",
        consulta:
        "Estoy haciendo delivery y también ayudando en remodelaciones los fines de semana. ¿Cómo organizan su tiempo sin agotarse?",
        fecha: new Date(2025, 9, 21, 19, 30),
        vistas: 1342,
        usuario: {
        id_usuario: 14,
        nombres: "Paula",
        apellidos: "Rivas",
        },
        respuestas: {
        total: 16,
        ultimaRespuesta: new Date(2025, 9, 28, 17, 15),
        ultimoUsuario: {
            id_usuario: 40,
            nombres: "Ricardo",
            apellidos: "Castro",
        },
        },
    },
    {
        id_foro: 204,
        id_usuario: 27,
        titulo: "Recomendaciones de apps para encontrar trabajos espontáneos",
        consulta:
        "¿Alguien usa apps o grupos para encontrar trabajos ocasionales? Me interesa recomendaciones seguras y confiables.",
        fecha: new Date(2025, 9, 25, 9, 50),
        vistas: 1198,
        usuario: {
        id_usuario: 27,
        nombres: "Juan",
        apellidos: "Sandoval",
        },
        respuestas: {
        total: 22,
        ultimaRespuesta: new Date(2025, 9, 29, 13, 20),
        ultimoUsuario: {
            id_usuario: 8,
            nombres: "Fernanda",
            apellidos: "Muñoz",
        },
        },
    },
    {
        id_foro: 205,
        id_usuario: 33,
        titulo: "Historias de experiencias positivas y negativas con clientes",
        consulta:
        "Quisiera leer experiencias de otros usuarios sobre clientes complicados o que pagan bien en trabajos informales.",
        fecha: new Date(2025, 9, 19, 12, 10),
        vistas: 1125,
        usuario: {
        id_usuario: 33,
        nombres: "Álvaro",
        apellidos: "Espinoza",
        },
        respuestas: {
        total: 9,
        ultimaRespuesta: new Date(2025, 9, 27, 16, 0),
        ultimoUsuario: {
            id_usuario: 55,
            nombres: "Marcela",
            apellidos: "Lagos",
        },
        },
    },
    {
        id_foro: 206,
        id_usuario: 44,
        titulo: "Cómo negociar precios sin perder clientes en trabajos casuales",
        consulta:
        "Me cuesta poner precio justo sin espantar clientes. ¿Alguien tiene estrategias o consejos para negociar?",
        fecha: new Date(2025, 9, 24, 14, 30),
        vistas: 1012,
        usuario: {
        id_usuario: 44,
        nombres: "Isabel",
        apellidos: "Navarro",
        },
        respuestas: {
        total: 14,
        ultimaRespuesta: new Date(2025, 9, 29, 9, 15),
        ultimoUsuario: {
            id_usuario: 60,
            nombres: "Tomás",
            apellidos: "Soto",
        },
        },
    },
    ];


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
          <svg
            className="h-6 w-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Foros Más Vistos
          </h2>
          <p className="text-sm text-slate-600">
            Los foros más populares de la comunidad
          </p>
        </div>
      </div>

      {forums.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-900">
            No hay datos de vistas disponibles
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Los foros más vistos aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forums.map((forum) => (
            <ForumCard key={forum.id_foro} forum={forum} />
          ))}
        </div>
      )}
    </div>
  );
}