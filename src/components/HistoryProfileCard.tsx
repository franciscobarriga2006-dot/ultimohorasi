"use client";

import { CSSProperties, useMemo } from "react";

type NullableDate = string | number | Date | null | undefined;

type UsuarioLigero = {
  id_usuario?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
  correo?: string | null;
};

type PublicacionHistoria = {
  id_publicacion: number;
  id_usuario?: number | null;
  titulo: string;
  descripcion?: string | null;
  direccion?: string | null;
  horario?: string | null;
  tipo?: string | null;
  monto?: number | null;
  horas?: string | null;
  estado?: "activa" | "pausada" | "cerrada" | "eliminada" | null;
  ciudad?: string | null;
  region?: string | null;
  created_at?: NullableDate;
  fecha_actualizacion?: NullableDate;
};

type PostulacionHistoria = {
  id_postulacion: number;
  id_publicacion: number;
  id_postulante: number;
  mensaje?: string | null;
  estado_postulacion?: "pendiente" | "aceptada" | "rechazada" | null;
  fecha?: NullableDate;
  publicacion?: Pick<PublicacionHistoria, "id_publicacion" | "titulo"> | null;
  postulante?: UsuarioLigero | null;
};

type ForoHistoria = {
  id_foro: number;
  id_usuario: number;
  titulo: string;
  consulta: string;
  fecha: NullableDate;
  usuario?: UsuarioLigero | null;
};

export type HistoryProfile = {
  id_usuario: number;
  usuario?: UsuarioLigero | null;
  publicaciones?: PublicacionHistoria[] | null;
  postulaciones?: PostulacionHistoria[] | null;
  foros?: ForoHistoria[] | null;
};

type HistoryProfileCardProps = {
  profile: HistoryProfile;
  onViewPublication?: (publicacionId: number) => void;
  onViewPostulacion?: (postulacionId: number) => void;
  onViewForo?: (foroId: number) => void;
  publicationActionLabel?: string;
  postulacionActionLabel?: string;
  foroActionLabel?: string;
};

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

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null || Number.isNaN(Number(amount))) return null;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

const formatLocation = (ciudad?: string | null, region?: string | null) => {
  const parts = [ciudad, region].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const getUsuarioNombre = (
  usuario: UsuarioLigero | null | undefined,
  fallbackId?: number,
) => {
  if (!usuario) return fallbackId ? `Usuario #${fallbackId}` : "—";

  const partes = [usuario.nombres, usuario.apellidos].filter(Boolean);

  if (partes.length) return partes.join(" ");
  if (usuario.correo) return usuario.correo;
  if (usuario.id_usuario) return `Usuario #${usuario.id_usuario}`;
  if (fallbackId) return `Usuario #${fallbackId}`;
  return "—";
};

const formatEstadoBadge = (
  estado: string | null | undefined,
  palette: "job" | "post" | "forum" = "job",
) => {
  if (!estado) return { text: "—", className: "bg-slate-100 text-[color:var(--foreground)] opacity-70" };

  const normalized = estado.replace(/_/g, " ");

  if (palette === "post") {
    switch (estado) {
      case "aceptada":
        return { text: normalized, className: "bg-emerald-100 text-emerald-700" };
      case "rechazada":
        return { text: normalized, className: "bg-rose-100 text-rose-600" };
      default:
        return { text: normalized, className: "bg-amber-100 text-amber-700" };
    }
  }

  switch (estado) {
    case "activa":
      return { text: normalized, className: "bg-emerald-100 text-emerald-700" };
    case "pausada":
      return { text: normalized, className: "bg-amber-100 text-amber-700" };
    case "cerrada":
      return { text: normalized, className: "bg-slate-200 text-[color:var(--foreground)] opacity-75" };
    case "eliminada":
      return { text: normalized, className: "bg-rose-100 text-rose-600" };
    default:
      return { text: normalized, className: "bg-slate-100 text-[color:var(--foreground)] opacity-70" };
  }
};

const mensajePreview = (mensaje?: string | null) => {
  if (!mensaje) return "Sin mensaje";

  const trimmed = mensaje.trim();
  if (!trimmed) return "Sin mensaje";
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117)}...`;
};

const descripcionPreview = (texto?: string | null) => {
  if (!texto) return "Sin descripción";

  const trimmed = texto.trim();
  if (!trimmed) return "Sin descripción";
  if (trimmed.length <= 160) return trimmed;
  return `${trimmed.slice(0, 157)}...`;
};

const CARD_BG = "var(--card-bg)";
const CARD_BORDER = "var(--card-border)";
const FOREGROUND = "var(--foreground)";
const PRIMARY = "var(--primary)";
const BTN_BG = "var(--btn-bg)";
const BTN_TEXT = "var(--btn-text)";
const MUTED_FOREGROUND = "color-mix(in srgb, var(--foreground) 65%, transparent)";
const SURFACE_SUBTLE = "color-mix(in srgb, var(--card-bg) 92%, var(--foreground) 8%)";
const PRIMARY_TINT = "color-mix(in srgb, var(--primary) 18%, transparent)";

const cardStyle: CSSProperties = {
  backgroundColor: CARD_BG,
  borderColor: CARD_BORDER,
  color: FOREGROUND,
};

const subtleSurfaceStyle: CSSProperties = {
  backgroundColor: SURFACE_SUBTLE,
  borderColor: CARD_BORDER,
};

const badgeNeutralStyle: CSSProperties = {
  backgroundColor: PRIMARY_TINT,
  color: PRIMARY,
};

type StatProps = { label: string; value: string | number; };

const StatBadge = ({ label, value }: StatProps) => (
  <div
    className="flex flex-col items-center justify-center rounded-xl border px-4 py-3"
    style={{ backgroundColor: SURFACE_SUBTLE, borderColor: CARD_BORDER }}
  >
    <span className="text-2xl font-semibold" style={{ color: FOREGROUND }}>
      {value}
    </span>
    <span
      className="mt-1 text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: MUTED_FOREGROUND }}
    >
      {label}
    </span>
  </div>
);

export default function HistoryProfileCard({
  profile,
  onViewPublication,
  onViewPostulacion,
  onViewForo,
  publicationActionLabel = "Ver publicación",
  postulacionActionLabel = "Ver postulación",
  foroActionLabel = "Ver foro",
}: HistoryProfileCardProps) {
  const publicaciones = profile.publicaciones ?? [];
  const postulaciones = profile.postulaciones ?? [];
  const foros = profile.foros ?? [];

  const usuarioNombre = useMemo(
    () => getUsuarioNombre(profile.usuario, profile.id_usuario),
    [profile.usuario, profile.id_usuario],
  );

  return (
    <article
      className="group relative flex h-full flex-col gap-6 rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
      style={cardStyle}
    >
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span
            className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide"
            style={{ color: MUTED_FOREGROUND }}
          >
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              style={badgeNeutralStyle}
            >
              #{profile.id_usuario}
            </span>
            Historial de perfil
          </span>
          <h3 className="mt-2 text-2xl font-semibold leading-tight" style={{ color: FOREGROUND }}>
            {usuarioNombre}
          </h3>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3">
            <StatBadge label="Publicaciones" value={publicaciones.length} />
            <StatBadge label="Postulaciones" value={postulaciones.length} />
            <StatBadge label="Foros" value={foros.length} />
          </div>
        </header>

      <section aria-label="Publicaciones" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] opacity-70">
              Publicaciones creadas
            </h4>
            {publicaciones.length > 3 && (
              <span className="text-xs text-[color:var(--foreground)] opacity-50">
                Mostrando {Math.min(3, publicaciones.length)} de {publicaciones.length}
              </span>
            )}
          </div>

          {publicaciones.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-4 py-3 text-sm text-[color:var(--foreground)] opacity-70">
              Este usuario aún no registra publicaciones.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {publicaciones.slice(0, 3).map((pub) => {
                const estadoBadge = formatEstadoBadge(pub.estado ?? null, "job");
                const monto = formatCurrency(pub.monto);

                return (
                  <article
                    key={pub.id_publicacion}
                    className="rounded-2xl border border-[color:var(--card-border)] p-4 transition-shadow hover:shadow-md"
                  >
                    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h5 className="text-base font-semibold text-[color:var(--foreground)] line-clamp-1">
                          {pub.titulo}
                        </h5>
                        <p className="text-xs text-[color:var(--foreground)] opacity-70">
                          ID publicación #{pub.id_publicacion}
                        </p>
                      </div>

                      <span
                        className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-semibold capitalize ${estadoBadge.className}`}
                      >
                        {estadoBadge.text}
                      </span>
                    </header>

                    <p className="mt-3 text-sm text-[color:var(--foreground)] opacity-75 line-clamp-3">
                      {descripcionPreview(pub.descripcion)}
                    </p>

                    <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                      <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                        <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Monto</dt>
                        <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                          {monto ?? "Sin especificar"}
                        </dd>
                      </div>

                      <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                        <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Ubicación</dt>
                        <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                          {formatLocation(pub.ciudad, pub.region)}
                        </dd>
                      </div>

                      <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                        <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Horario</dt>
                        <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                          {pub.horario?.trim() || "—"}
                        </dd>
                      </div>

                      <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                        <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Última actualización</dt>
                        <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                          {formatDateTime(pub.fecha_actualizacion ?? pub.created_at)}
                        </dd>
                      </div>
                    </dl>

                    {onViewPublication && (
                      <div className="mt-4 flex justify-end">
                        <button
                          className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 hover:bg-[color:var(--btn-hover)]"
                          type="button"
                          style={{ backgroundColor: BTN_BG, color: BTN_TEXT }}
                          onClick={() => onViewPublication(pub.id_publicacion)}
                        >
                          {publicationActionLabel}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

      <section aria-label="Postulaciones" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] opacity-70">
              Postulaciones realizadas
            </h4>
            {postulaciones.length > 3 && (
              <span className="text-xs text-[color:var(--foreground)] opacity-50">
                Mostrando {Math.min(3, postulaciones.length)} de {postulaciones.length}
              </span>
            )}
          </div>

          {postulaciones.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-4 py-3 text-sm text-[color:var(--foreground)] opacity-70">
              No hay postulaciones registradas para este usuario.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {postulaciones.slice(0, 3).map((post) => {
                const estadoBadge = formatEstadoBadge(post.estado_postulacion ?? null, "post");

                return (
                  <article
                    key={post.id_postulacion}
                    className="rounded-2xl border border-[color:var(--card-border)] p-4 transition-shadow hover:shadow-md"
                  >
                    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h5 className="text-base font-semibold text-[color:var(--foreground)] line-clamp-1">
                          {post.publicacion?.titulo || `Postulación a publicación #${post.id_publicacion}`}
                        </h5>
                        <p className="text-xs text-[color:var(--foreground)] opacity-70">
                          ID postulación #{post.id_postulacion}
                        </p>
                      </div>

                      <span
                        className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-semibold capitalize ${estadoBadge.className}`}
                      >
                        {estadoBadge.text}
                      </span>
                    </header>

                    <p className="mt-3 text-sm text-[color:var(--foreground)] opacity-75">{mensajePreview(post.mensaje)}</p>

                    <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                      <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                        <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Fecha de postulación</dt>
                        <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                          {formatDateTime(post.fecha)}
                        </dd>
                      </div>

                      <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                        <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Postulante</dt>
                        <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                          {getUsuarioNombre(post.postulante, post.id_postulante)}
                        </dd>
                      </div>
                    </dl>

                    {onViewPostulacion && (
                      <div className="mt-4 flex justify-end">
                        <button
                          className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 hover:bg-[color:var(--btn-hover)]"
                          type="button"
                          style={{ backgroundColor: BTN_BG, color: BTN_TEXT }}
                          onClick={() => onViewPostulacion(post.id_postulacion)}
                        >
                          {postulacionActionLabel}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

      <section aria-label="Foros" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] opacity-70">
              Participación en foros
            </h4>
            {foros.length > 3 && (
              <span className="text-xs text-[color:var(--foreground)] opacity-50">
                Mostrando {Math.min(3, foros.length)} de {foros.length}
              </span>
            )}
          </div>

          {foros.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-4 py-3 text-sm text-[color:var(--foreground)] opacity-70">
              Sin actividad en foros registrada para este usuario.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {foros.slice(0, 3).map((foro) => (
                <article
                  key={foro.id_foro}
                  className="rounded-2xl border border-[color:var(--card-border)] p-4 transition-shadow hover:shadow-md"
                >
                  <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h5 className="text-base font-semibold text-[color:var(--foreground)] line-clamp-2">
                        {foro.titulo}
                      </h5>
                      <p className="text-xs text-[color:var(--foreground)] opacity-70">
                        ID foro #{foro.id_foro}
                      </p>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {formatDateTime(foro.fecha)}
                    </span>
                  </header>

                  <p className="mt-3 text-sm text-[color:var(--foreground)] opacity-75 line-clamp-3">{descripcionPreview(foro.consulta)}</p>

                  <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                    <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                      <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Autor</dt>
                      <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                        {getUsuarioNombre(foro.usuario, foro.id_usuario)}
                      </dd>
                    </div>

                    <div className="rounded-xl bg-[color:var(--card-bg)] px-3 py-2 ring-1 ring-[color:var(--card-border)]">
                      <dt className="font-medium uppercase tracking-wide text-[color:var(--foreground)] opacity-70">Usuario asociado</dt>
                      <dd className="mt-1 text-sm font-semibold text-[color:var(--foreground)] opacity-90">
                        {usuarioNombre}
                      </dd>
                    </div>
                  </dl>

                  {onViewForo && (
                    <div className="mt-4 flex justify-end">
                      <button
                        className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 hover:bg-[color:var(--btn-hover)]"
                        type="button"
                        style={{ backgroundColor: BTN_BG, color: BTN_TEXT }}
                        onClick={() => onViewForo(foro.id_foro)}
                      >
                        {foroActionLabel}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
    </article>
  );
}