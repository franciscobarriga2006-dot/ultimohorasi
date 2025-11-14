"use client";

import { useMemo } from "react";

type NullableDate = string | number | Date | null | undefined;

type UsuarioLigero = {
  id_usuario?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
  correo?: string | null;
};

type PublicacionResumen = {
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
  fecha_publicacion?: NullableDate;
  fecha_actualizacion?: NullableDate;
  autor?: UsuarioLigero | null;
};

export type GuardadoFavorito = {
  id_guardado: number;
  id_usuario: number;
  id_publicacion: number;
  fecha: NullableDate;
  usuario?: UsuarioLigero | null;
  publicacion?: PublicacionResumen | null;
};

type FavoriteCardProps = {
  favorite: GuardadoFavorito;
  href?: string;
  onView?: (publicacionId: number) => void;
  onRemove?: (guardadoId: number) => void;
  viewLabel?: string;
  removeLabel?: string;
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

const formatMonto = (monto: number | null | undefined) => {
  if (monto == null || Number.isNaN(Number(monto))) return null;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(Number(monto));
};

const getUsuarioNombre = (usuario: UsuarioLigero | null | undefined, fallbackId?: number) => {
  if (!usuario) return fallbackId ? `Usuario #${fallbackId}` : "—";

  const partes = [usuario.nombres, usuario.apellidos].filter(Boolean);

  if (partes.length) return partes.join(" ");
  if (usuario.correo) return usuario.correo;
  if (usuario.id_usuario) return `Usuario #${usuario.id_usuario}`;
  if (fallbackId) return `Usuario #${fallbackId}`;
  return "—";
};

export default function FavoriteCard({
  favorite,
  href,
  onView,
  onRemove,
  viewLabel = "Ver publicación",
  removeLabel = "Quitar de favoritos",
}: FavoriteCardProps) {
  const actionView = href ? (
    <a
      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      href={href}
    >
      {viewLabel}
    </a>
  ) : onView ? (
    <button
      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      type="button"
      onClick={() => onView(favorite.id_publicacion)}
    >
      {viewLabel}
    </button>
  ) : null;

  const actionRemove = onRemove ? (
    <button
      className="inline-flex items-center justify-center rounded-xl border border-transparent px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      type="button"
      onClick={() => onRemove(favorite.id_guardado)}
    >
      {removeLabel}
    </button>
  ) : null;

  const montoTexto = useMemo(() => formatMonto(favorite.publicacion?.monto ?? null), [favorite.publicacion?.monto]);

  const estadoTexto = favorite.publicacion?.estado
    ? favorite.publicacion.estado.charAt(0).toUpperCase() + favorite.publicacion.estado.slice(1)
    : null;

  return (
    <article className="group relative h-full rounded-2xl bg-gradient-to-tr from-emerald-500/25 via-teal-500/25 to-cyan-500/25 p-[1px]">
      <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">#{favorite.id_guardado}</span>
              Favorito
            </span>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
              {favorite.publicacion?.titulo ?? "Publicación sin título"}
            </h3>
          </div>

          <dl className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
            <div className="font-semibold text-slate-700">Guardado el</div>
            <div className="text-sm font-medium text-slate-800">{formatDateTime(favorite.fecha)}</div>
          </dl>
        </header>

        {favorite.publicacion?.descripcion && (
          <p className="text-sm text-slate-700 line-clamp-4">{favorite.publicacion.descripcion}</p>
        )}

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Autor</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {getUsuarioNombre(favorite.publicacion?.autor, favorite.publicacion?.id_usuario ?? favorite.id_usuario)}
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Estado</dt>
            <dd className="mt-1 font-medium text-slate-800">{estadoTexto ?? "No especificado"}</dd>
          </div>

          {(favorite.publicacion?.ciudad || favorite.publicacion?.region) && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ubicación</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {[favorite.publicacion?.ciudad, favorite.publicacion?.region].filter(Boolean).join(", ")}
              </dd>
            </div>
          )}

          {(favorite.publicacion?.horario || favorite.publicacion?.tipo) && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Modalidad</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {[favorite.publicacion?.tipo, favorite.publicacion?.horario].filter(Boolean).join(" · ") || "No especificado"}
              </dd>
            </div>
          )}

          {(favorite.publicacion?.monto != null || favorite.publicacion?.horas) && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compensación</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {montoTexto ? `${montoTexto}${favorite.publicacion?.horas ? ` · ${favorite.publicacion.horas}` : ""}` : favorite.publicacion?.horas ?? "No especificado"}
              </dd>
            </div>
          )}

          {(favorite.publicacion?.fecha_publicacion || favorite.publicacion?.fecha_actualizacion) && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Actualizado</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatDateTime(favorite.publicacion?.fecha_actualizacion ?? favorite.publicacion?.fecha_publicacion)}
              </dd>
            </div>
          )}
        </dl>

        <footer className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-500">ID publicación: #{favorite.id_publicacion}</span>
          <div className="flex flex-wrap gap-2">
            {actionView}
            {actionRemove}
          </div>
        </footer>
      </div>
    </article>
  );
}