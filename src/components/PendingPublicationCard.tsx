import * as React from "react";

export type Publication = {
  id_publicacion: number;
  id_usuario: number;
  titulo: string;
  descripcion: string;
  direccion?: string | null;
  horario?: string | null;
  tipo?: string | null;
  monto?: number | string | null;
  horas?: string | null;
  estado: "activa" | "pausada" | "cerrada" | "eliminada";
  ciudad?: string | null;
  region?: string | null;
  created_at?: string | null;
  fecha_actualizacion?: string | null;
};

const estadoStyle: Record<Publication["estado"], string> = {
  activa: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pausada: "bg-amber-50 text-amber-700 ring-amber-200",
  cerrada: "bg-gray-100 text-gray-700 ring-gray-300",
  eliminada: "bg-rose-50 text-rose-700 ring-rose-200",
};

const clp = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n)
    ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)
    : "—";
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export type PendingPublicationCardProps = {
  publication: Publication;
  className?: string;
};

export default function PendingPublicationCard({
  publication,
  className,
}: PendingPublicationCardProps) {
  const p = publication;

  // 🔸 Solo mostrar publicaciones "pendientes" (no activas)
  if (p.estado === "activa") {
    return null; // No se renderiza si la publicación está activa
  }

  const ubicacion = [p.ciudad, p.region].filter(Boolean).join(", ") || "—";

  return (
    <article
      className={[
        "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition",
        className ?? "",
      ].join(" ")}
      aria-labelledby={`pub-${p.id_publicacion}-title`}
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <h3
          id={`pub-${p.id_publicacion}-title`}
          className="text-lg font-semibold text-gray-900"
        >
          {p.titulo}
        </h3>
        <span
          className={[
            "shrink-0 rounded-full px-2 py-0.5 text-xs ring font-medium capitalize",
            estadoStyle[p.estado],
          ].join(" ")}
        >
          {p.estado}
        </span>
      </div>

      {/* Mensaje visual de estado pendiente */}
      {p.estado === "pausada" && (
        <p className="mt-1 text-sm text-amber-600 font-medium">
          En revisión o pendiente de activación
        </p>
      )}

      <p className="mt-2 text-sm text-gray-700">{p.descripcion}</p>

      {/* Detalles */}
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
          <dt className="text-xs text-gray-500">Tipo</dt>
          <dd className="font-medium">{p.tipo ?? "—"}</dd>
        </div>
        <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
          <dt className="text-xs text-gray-500">Monto</dt>
          <dd className="font-medium">{clp(p.monto)}</dd>
        </div>

        {p.horas && (
          <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
            <dt className="text-xs text-gray-500">Horas</dt>
            <dd className="font-medium">{p.horas}</dd>
          </div>
        )}
        {p.horario && (
          <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
            <dt className="text-xs text-gray-500">Horario</dt>
            <dd className="font-medium">{p.horario}</dd>
          </div>
        )}

        <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200 sm:col-span-2">
          <dt className="text-xs text-gray-500">Dirección</dt>
          <dd className="font-medium">{p.direccion ?? "—"}</dd>
        </div>

        <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
          <dt className="text-xs text-gray-500">Ubicación</dt>
          <dd className="font-medium">{ubicacion}</dd>
        </div>

        <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
          <dt className="text-xs text-gray-500">Creada</dt>
          <dd className="font-medium">{fmtDate(p.created_at)}</dd>
        </div>

        <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
          <dt className="text-xs text-gray-500">Actualizada</dt>
          <dd className="font-medium">{fmtDate(p.fecha_actualizacion)}</dd>
        </div>
      </dl>

      {/* Footer con IDs */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span>
          id_publicacion:{" "}
          <strong className="text-gray-700">{p.id_publicacion}</strong>
        </span>
        <span>
          id_usuario: <strong className="text-gray-700">{p.id_usuario}</strong>
        </span>
      </div>
    </article>
  );
}
