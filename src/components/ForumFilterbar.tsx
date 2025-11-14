"use client";

import { useEffect, useMemo, useState } from "react";

export type ForumFilter = {
  forumId?: string;
  title?: string;
  question?: string;
  authorId?: string;
  createdFrom?: string;
  createdTo?: string;
  responseStatus?: "con-respuestas" | "sin-respuestas" | "todas";
};

export type ForumFilterbarProps = {
  value?: ForumFilter;
  onChange?: (next: ForumFilter) => void;
  onApply?: (next: ForumFilter) => void;
  onReset?: () => void;
  isPending?: boolean;
  className?: string;
};

const defaultFilter: ForumFilter = {
  forumId: "",
  title: "",
  question: "",
  authorId: "",
  createdFrom: "",
  createdTo: "",
  responseStatus: "todas",
};

function mergeValue(value?: ForumFilter): ForumFilter {
  if (!value) return { ...defaultFilter };
  return { ...defaultFilter, ...value };
}

export default function ForumFilterbar({
  value,
  onChange,
  onApply,
  onReset,
  isPending = false,
  className = "",
}: ForumFilterbarProps) {
  const initial = useMemo(() => mergeValue(value), [value]);
  const [filters, setFilters] = useState<ForumFilter>(initial);

  useEffect(() => {
    setFilters(mergeValue(value));
  }, [value]);

  const update = (patch: Partial<ForumFilter>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      onChange?.(next);
      return next;
    });
  };

  const handleReset = () => {
    const resetValue = mergeValue(undefined);
    setFilters(resetValue);
    onChange?.(resetValue);
    onReset?.();
  };

  const handleApply = () => {
    onApply?.(filters);
  };

  return (
    <section
      className={`rounded-2xl bg-white/90 p-4 ring-1 ring-gray-200 shadow-sm backdrop-blur ${className}`.trim()}
      aria-label="Filtros de foros"
    >
      <div className="grid grid-flow-row-dense gap-4 sm:gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {/* id_foro */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">ID del foro</span>
          <input
            type="text"
            inputMode="numeric"
            value={filters.forumId}
            onChange={(event) => update({ forumId: event.target.value })}
            placeholder="Ej. 152"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* titulo */}
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-sm font-medium text-gray-600">Título</span>
          <input
            type="text"
            value={filters.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Texto del título"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* consulta */}
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-sm font-medium text-gray-600">Consulta</span>
          <input
            type="text"
            value={filters.question}
            onChange={(event) => update({ question: event.target.value })}
            placeholder="Palabras clave de la consulta"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Autor (id_usuario) */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Autor</span>
          <input
            type="text"
            inputMode="numeric"
            value={filters.authorId}
            onChange={(event) => update({ authorId: event.target.value })}
            placeholder="ID de usuario"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Fecha de creación desde (fecha) */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Desde</span>
          <input
            type="date"
            value={filters.createdFrom}
            max={filters.createdTo || undefined}
            onChange={(event) => update({ createdFrom: event.target.value })}
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Fecha de creación hasta (fecha) */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Hasta</span>
          <input
            type="date"
            value={filters.createdTo}
            min={filters.createdFrom || undefined}
            onChange={(event) => update({ createdTo: event.target.value })}
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Estado de respuestas basado en Respuestas_foros */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Respuestas</span>
          <select
            value={filters.responseStatus}
            onChange={(event) =>
              update({
                responseStatus: event.target.value as ForumFilter["responseStatus"],
              })
            }
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas</option>
            <option value="con-respuestas">Con respuestas</option>
            <option value="sin-respuestas">Sin respuestas</option>
          </select>
        </label>

        <div className="col-span-full flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isPending}
            className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>
  );
}