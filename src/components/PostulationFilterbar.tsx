"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, KeyboardEvent } from "react";

export default function PostulationFilterbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Usamos prefijo `p_` para no chocar con otros filtros de la página
  const [q, setQ] = useState(sp.get("p_q") ?? "");
  const [estado, setEstado] = useState(sp.get("p_estado") ?? "");
  const [fecha, setFecha] = useState(sp.get("p_fecha") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQ(sp.get("p_q") ?? "");
    setEstado(sp.get("p_estado") ?? "");
    setFecha(sp.get("p_fecha") ?? "");
  }, [sp]);

  const apply = () => {
    const params = new URLSearchParams();
    if (q) params.set("p_q", String(q));
    if (estado) params.set("p_estado", estado);
    if (fecha) params.set("p_fecha", fecha);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  };

  const clearAll = () => {
    setQ("");
    setEstado("");
    setFecha("");
    startTransition(() => router.replace(pathname));
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") apply();
  };

  return (
    <section className="rounded-2xl bg-white/80 p-3 sm:p-4 ring-1 ring-gray-200 shadow-sm backdrop-blur">
      <div
        className="
          grid grid-flow-row-dense gap-3
          [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]
        "
      >
        {/* Búsqueda por título / palabra */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Buscar por título"
          aria-label="Buscar por título"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          type="search"
        />

        {/* Estado de la postulación */}
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          onKeyDown={onEnter}
          aria-label="Estado de la postulación"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
        </select>

        {/* Fecha */}
        <input
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Fecha"
          aria-label="Fecha"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          type="date"
        />

        <div className="col-span-full flex items-center justify-start gap-2">
          <button
            onClick={clearAll}
            disabled={isPending}
            className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm hover:bg-gray-50 disabled:opacity-60"
            type="button"
          >
            Limpiar
          </button>
          <button
            onClick={apply}
            disabled={isPending}
            className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            type="button"
          >
            Aplicar
          </button>
        </div>
      </div>
    </section>
  );
}