"use client";

import type { ForumFilter } from "./ForumFilterbar";
import { motion } from "framer-motion";
import { fadeInUp } from "@/components/animations";

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
  vistas?: number | null;
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
function ForumCard({ forum }: { forum: DashboardForum }) {
  const respuestasTotales = forum.respuestas?.total ?? null;
  const hasRespuestas =
    typeof respuestasTotales === "number" && respuestasTotales > 0;

  return (
    <motion.article
      className="group relative h-full rounded-2xl bg-gradient-to-tr from-sky-500/25 via-indigo-500/25 to-purple-500/25 p-[1px]"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <header className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-blue-600">
                #{forum.id_foro}
              </span>
              Foro
            </span>
            <div className="flex gap-2">
              {typeof forum.vistas === "number" && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-600 ring-1 ring-amber-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-semibold">{forum.vistas}</span>
                </div>
              )}
              {typeof respuestasTotales === "number" && (
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 font-semibold text-blue-600 text-xs">
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
          <span className="text-xs text-slate-500">ID usuario: #{forum.id_usuario}</span>
          <motion.button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
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

// =============Datos Mockup (borrar cuando se implemente el backend) =============
export default function AllForums({ filters }: { filters?: ForumFilter } = {}) {
  const forums: DashboardForum[] = [
    {
      id_foro: 201,
      id_usuario: 15,
      titulo: "¿Cómo conseguir clientes para trabajos ocasionales?",
      consulta:
        "Estoy empezando a hacer trabajos de limpieza y jardinería. ¿Qué estrategias usan para conseguir clientes confiables?",
      fecha: new Date(2025, 9, 29, 14, 30),
      vistas: 234,
      usuario: {
        id_usuario: 15,
        nombres: "María",
        apellidos: "González",
        correo: "maria.g@example.com",
      },
      respuestas: {
        total: 8,
        ultimaRespuesta: new Date(2025, 9, 30, 10, 15),
        ultimoUsuario: {
          id_usuario: 23,
          nombres: "Pedro",
          apellidos: "Martínez",
        },
      },
    },
    {
      id_foro: 202,
      id_usuario: 42,
      titulo: "Experiencias ofreciendo clases particulares sin título",
      consulta:
        "Algunos dan clases de apoyo escolar sin ser profesionales. ¿Qué les ha funcionado para atraer estudiantes y fijar precios?",
      fecha: new Date(2025, 9, 29, 16, 45),
      vistas: 156,
      usuario: {
        id_usuario: 42,
        nombres: "Carlos",
        apellidos: "Ruiz",
      },
      respuestas: {
        total: 5,
        ultimaRespuesta: new Date(2025, 9, 29, 18, 20),
        ultimoUsuario: {
          id_usuario: 18,
          nombres: "Ana",
          apellidos: "López",
        },
      },
    },
    {
      id_foro: 203,
      id_usuario: 27,
      titulo: "Consejos para organizar horarios si tienes varios trabajos informales",
      consulta:
        "Hago delivery y reparaciones los fines de semana. ¿Cómo organizan su tiempo sin agotarse y mantener clientes satisfechos?",
      fecha: new Date(2025, 9, 30, 9, 10),
      vistas: 89,
      usuario: {
        id_usuario: 27,
        nombres: "Luis",
        apellidos: "Fernández",
        correo: "luis.f@example.com",
      },
      respuestas: {
        total: 3,
        ultimaRespuesta: new Date(2025, 9, 30, 11, 30),
        ultimoUsuario: {
          id_usuario: 31,
          nombres: "Sofía",
          apellidos: "Torres",
        },
      },
    },
    {
      id_foro: 204,
      id_usuario: 56,
      titulo: "Apps y grupos para encontrar trabajos informales",
      consulta:
        "¿Usan alguna app o grupo de Facebook/WhatsApp para trabajos ocasionales? Recomienden solo los confiables.",
      fecha: new Date(2025, 9, 30, 11, 50),
      vistas: 67,
      usuario: {
        id_usuario: 56,
        nombres: "Fernando",
        apellidos: "Castro",
      },
      respuestas: {
        total: 2,
        ultimaRespuesta: new Date(2025, 9, 30, 13, 15),
        ultimoUsuario: {
          id_usuario: 39,
          nombres: "Valentina",
          apellidos: "Rojas",
        },
      },
    },
    {
      id_foro: 205,
      id_usuario: 21,
      titulo: "Historias de clientes difíciles o buenos pagos",
      consulta:
        "Compartan experiencias sobre clientes complicados o que pagan bien en trabajos informales. ¿Qué aprendieron?",
      fecha: new Date(2025, 9, 30, 13, 20),
      vistas: 45,
      usuario: {
        id_usuario: 21,
        nombres: "Isabel",
        apellidos: "Mendoza",
      },
      respuestas: {
        total: 1,
        ultimaRespuesta: new Date(2025, 9, 30, 14, 5),
        ultimoUsuario: {
          id_usuario: 47,
          nombres: "Daniel",
          apellidos: "Vargas",
        },
      },
    },
    {
      id_foro: 206,
      id_usuario: 33,
      titulo: "Negociación de precios en trabajos ocasionales",
      consulta:
        "Me cuesta poner un precio justo sin perder clientes. ¿Cómo negocian sin perder oportunidades ni sentirse mal pagados?",
      fecha: new Date(2025, 9, 30, 15, 0),
      vistas: 28,
      usuario: {
        id_usuario: 33,
        nombres: "Camila",
        apellidos: "Soto",
      },
      respuestas: {
        total: 0,
      },
    },
    {
      id_foro: 207,
      id_usuario: 19,
      titulo: "Seguridad al trabajar con desconocidos",
      consulta:
        "Me preocupa la seguridad cuando voy a casas de personas que no conozco. ¿Qué precauciones toman ustedes?",
      fecha: new Date(2025, 9, 28, 10, 20),
      vistas: 312,
      usuario: {
        id_usuario: 19,
        nombres: "Gabriela",
        apellidos: "Morales",
      },
      respuestas: {
        total: 12,
        ultimaRespuesta: new Date(2025, 9, 30, 16, 45),
        ultimoUsuario: {
          id_usuario: 52,
          nombres: "Roberto",
          apellidos: "Silva",
        },
      },
    },
    {
      id_foro: 208,
      id_usuario: 64,
      titulo: "Cómo cobrar por servicios de reparación",
      consulta:
        "Reparo electrodomésticos y no sé si cobrar por hora o por trabajo. ¿Qué les funciona mejor?",
      fecha: new Date(2025, 9, 27, 15, 30),
      vistas: 178,
      usuario: {
        id_usuario: 64,
        nombres: "Javier",
        apellidos: "Herrera",
      },
      respuestas: {
        total: 6,
        ultimaRespuesta: new Date(2025, 9, 29, 12, 30),
        ultimoUsuario: {
          id_usuario: 28,
          nombres: "Patricia",
          apellidos: "Guzmán",
        },
      },
    },
    {
      id_foro: 209,
      id_usuario: 38,
      titulo: "Legalidad de trabajos informales",
      consulta:
        "¿Alguien sabe hasta qué punto es legal trabajar sin contrato? ¿Qué riesgos hay?",
      fecha: new Date(2025, 9, 26, 9, 15),
      vistas: 421,
      usuario: {
        id_usuario: 38,
        nombres: "Andrés",
        apellidos: "Ramírez",
      },
      respuestas: {
        total: 15,
        ultimaRespuesta: new Date(2025, 9, 30, 8, 20),
        ultimoUsuario: {
          id_usuario: 11,
          nombres: "Laura",
          apellidos: "Ortiz",
        },
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
          <svg
            className="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Todos los Foros
          </h2>
          <p className="text-sm text-slate-600">
            Explora todos los foros de la comunidad
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-900">
            No hay foros disponibles
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Los nuevos foros aparecerán aquí cuando se publiquen
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