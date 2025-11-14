"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, KeyboardEvent } from "react";

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [tipo, setTipo] = useState(sp.get("tipo") ?? "");
  const [ciudad, setCiudad] = useState(sp.get("ciudad") ?? "");
  const [region, setRegion] = useState(sp.get("region") ?? "");
  const [estado, setEstado] = useState(sp.get("estado") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setTipo(sp.get("tipo") ?? "");
    setCiudad(sp.get("ciudad") ?? "");
    setRegion(sp.get("region") ?? "");
    setEstado(sp.get("estado") ?? "");
  }, [sp]);

  const apply = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tipo) params.set("tipo", tipo);
    if (ciudad) params.set("ciudad", ciudad);
    if (region) params.set("region", region);
    if (estado) params.set("estado", estado);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearAll = () => {
    setQ(""); setTipo(""); setCiudad(""); setRegion(""); setEstado("");
    startTransition(() => router.push(pathname));
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") apply();
  };

  return (
    <section className="rounded-2xl bg-white/80 p-3 sm:p-4 ring-1 ring-gray-200 shadow-sm backdrop-blur">
      <div
        className="
          grid grid-flow-row-dense gap-3
          [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]
        "
      >
        {/* Buscar */}
        <div className="relative lg:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onEnter}
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            className="h-11 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">🔎</span>
        </div>

        {/* Tipo de trabajo (lista) */}
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          onKeyDown={onEnter}
          aria-label="Tipo de trabajo"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tipo de trabajo</option>
          <option value="necesidad">Necesidad</option>
          <option value="servicio">Servicio</option>
        </select>

        {/* Ciudad */}
        <input
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Ciudad"
          aria-label="Ciudad"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Región */}
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Región"
          aria-label="Región"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Estado */}
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          onKeyDown={onEnter}
          aria-label="Estado"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Estado</option>
          <option value="activa">Activa</option>
          <option value="pausada">Pausada</option>
          <option value="cerrada">Cerrada</option>
          <option value="eliminada">Eliminada</option>
        </select>

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
