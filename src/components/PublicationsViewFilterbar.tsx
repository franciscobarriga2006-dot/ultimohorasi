"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, KeyboardEvent, useRef } from "react";
import api from "@/lib/api";

/**
 * PublicationsViewFilterbar
 * - Añade animaciones y transiciones suaves usando clases de Tailwind.
 * - Ahora los selectores Ciudad y Estado se comportan como el selector de Etiquetas (dropdown animado).
 */

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [tipo, setTipo] = useState(sp.get("tipo") ?? "");
  const [ciudad, setCiudad] = useState(sp.get("ciudad") ?? "");
  const [region, setRegion] = useState(sp.get("region") ?? "");
  const [estado, setEstado] = useState(sp.get("estado") ?? "");
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (sp.get("etiquetas") ?? "").split(",").filter(Boolean)
  );

  const [cities, setCities] = useState<string[]>([]);
  // estados como opciones (ahora como dropdown)
  const stateOptions = [
    { value: "", label: "Todos los estados" },
    { value: "activa", label: "Activa" },
    { value: "pausada", label: "Pausada" },
    { value: "cerrada", label: "Cerrada" },
  ];

  const [isPending, startTransition] = useTransition();
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isTipoOpen, setIsTipoOpen] = useState(false);

  const dropdownTagsRef = useRef<HTMLDivElement>(null);
  const dropdownCityRef = useRef<HTMLDivElement>(null);
  const dropdownStateRef = useRef<HTMLDivElement>(null);
  const dropdownTipoRef = useRef<HTMLDivElement>(null);

  // Sincroniza con URL
  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setTipo(sp.get("tipo") ?? "");
    setCiudad(sp.get("ciudad") ?? "");
    setRegion(sp.get("region") ?? "");
    setEstado(sp.get("estado") ?? "");
    setSelectedTags((sp.get("etiquetas") ?? "").split(",").filter(Boolean));
  }, [sp]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownTagsRef.current && !dropdownTagsRef.current.contains(event.target as Node)) {
        setIsTagsOpen(false);
      }
      if (dropdownCityRef.current && !dropdownCityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
      if (dropdownStateRef.current && !dropdownStateRef.current.contains(event.target as Node)) {
        setIsStateOpen(false);
      }
      if (dropdownTipoRef.current && !dropdownTipoRef.current.contains(event.target as Node)) {
        setIsTipoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar etiquetas y ciudades desde API (si existen los endpoints)
  useEffect(() => {
    api
      .get("/publicaciones/etiquetas")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEtiquetas(data);
      })
      .catch(() => setEtiquetas([]));

    api
      .get("/publicaciones/ciudades")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // normalizar a strings si vienen objetos
        const names = data.map((c: any) => (typeof c === "string" ? c : c.nombre || c.ciudad || String(c)));
        setCities(Array.from(new Set(names)));
      })
      .catch(() => setCities([]));
  }, []);

  const apply = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tipo) params.set("tipo", tipo);
    if (ciudad) params.set("ciudad", ciudad);
    if (region) params.set("region", region);
    if (estado) params.set("estado", estado);
    if (selectedTags.length > 0) params.set("etiquetas", selectedTags.join(","));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearAll = () => {
    setQ("");
    setTipo("");
    setCiudad("");
    setRegion("");
    setEstado("");
    setSelectedTags([]);
    startTransition(() => router.push(pathname));
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") apply();
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const removeTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  // Etiquetas disponibles que no están seleccionadas
  const availableTags = etiquetas.filter((tag) => !selectedTags.includes(tag.nombre));

  return (
    <section className="rounded-2xl bg-white/80 p-3 sm:p-4 ring-1 ring-gray-200 shadow-sm backdrop-blur">
      <div
        className="
          grid grid-flow-row-dense gap-3
          [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]
        "
      >
        {/* Buscar - Ancho reducido */}
        <div className="relative group">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onEnter}
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            className="h-11 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none
                       focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 shadow-sm
                       focus:shadow-md"
          />
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 transition-transform duration-200 group-focus-within:translate-x-0 group-hover:translate-x-0">
            🔎
          </span>
        </div>

        {/* Tipo de trabajo - dropdown animado (comportamiento igual a etiquetas/ciudad/estado) */}
        <div className="relative z-50" ref={dropdownTipoRef}>
          <button
            onClick={() => {
              setIsTipoOpen((s) => !s);
              setIsTagsOpen(false);
              setIsCityOpen(false);
              setIsStateOpen(false);
            }}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none
                       focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-gray-50
                       transition transform active:scale-95"
            type="button"
            aria-expanded={isTipoOpen}
            aria-controls="tipos-list"
          >
            <span className="text-black">
              {tipo ? (tipo === "necesidad" ? "Necesidad" : tipo === "servicio" ? "Servicio" : tipo) : "Tipo de trabajo"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isTipoOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            id="tipos-list"
            role="listbox"
            className={`absolute left-0 top-full mt-2 w-56 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-[999]
                        transform origin-top-left transition-all duration-300 ${
                          isTipoOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => { setTipo(""); setIsTipoOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
              >
                Tipo de trabajo
              </button>
              <button
                type="button"
                onClick={() => { setTipo("necesidad"); setIsTipoOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
              >
                Necesidad
              </button>
              <button
                type="button"
                onClick={() => { setTipo("servicio"); setIsTipoOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
              >
                Servicio
              </button>
            </div>
          </div>
        </div>

        {/* Ciudad - ahora campo escribible con sugerencias */}
        <div className="relative z-50" ref={dropdownCityRef}>
          <input
            value={ciudad}
            onChange={(e) => {
              setCiudad(e.target.value);
              // abrir sugerencias al escribir
              setIsCityOpen(true);
              // cerrar otros dropdowns
              setIsTagsOpen(false);
              setIsStateOpen(false);
              setIsTipoOpen(false);
            }}
            onFocus={() => {
              setIsCityOpen(true);
              setIsTagsOpen(false);
              setIsStateOpen(false);
              setIsTipoOpen(false);
            }}
            onKeyDown={onEnter}
            placeholder="Ciudad"
            aria-label="Ciudad"
            className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none
                       focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            autoComplete="off"
          />

          <div
            id="ciudades-list"
            role="listbox"
            className={`absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-[999]
                        transform origin-top-left transition-all duration-300 ${
                          isCityOpen && (ciudad.trim() !== "" || cities.length > 0)
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
          >
            {cities.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">Sin sugerencias</p>
            ) : (
              <div className="py-1">
                {/* mostrar sugerencias filtradas por lo escrito (o las primeras si campo vacío) */}
                {cities
                  .filter((c) =>
                    ciudad.trim() === "" ? true : c.toLowerCase().includes(ciudad.trim().toLowerCase())
                  )
                  .slice(0, 50)
                  .map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCiudad(c);
                        setIsCityOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                      type="button"
                    >
                      {c}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Región */}
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Región"
          aria-label="Región"
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none
                     focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
        />

        {/* Estado - ahora dropdown animado (igual que etiquetas) */}
        <div className="relative z-50" ref={dropdownStateRef}>
          <button
            onClick={() => {
              setIsStateOpen((s) => !s);
              setIsTagsOpen(false);
              setIsCityOpen(false);
            }}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none
                       focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-gray-50
                       transition transform active:scale-95"
            type="button"
            aria-expanded={isStateOpen}
            aria-controls="estados-list"
          >
            <span className="text-black">
              {stateOptions.find((o) => o.value === estado)?.label ?? "Todos los estados"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isStateOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            id="estados-list"
            role="listbox"
            className={`absolute left-0 top-full mt-2 w-56 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-[999]
                        transform origin-top-left transition-all duration-300 ${
                          isStateOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
          >
            <div className="py-1">
              {stateOptions.map((opt) => (
                <button
                  key={opt.value || "all"}
                  onClick={() => { setEstado(opt.value); setIsStateOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selector de Etiquetas - Mismo tamaño que otros campos */}
        <div className="relative z-50" ref={dropdownTagsRef}>
          <button
            onClick={() => {
              setIsTagsOpen((s) => !s);
              setIsCityOpen(false);
              setIsStateOpen(false);
            }}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none
                       focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-gray-50
                       transition transform active:scale-95"
            type="button"
            aria-expanded={isTagsOpen}
            aria-controls="etiquetas-list"
          >
            <span className="text-black">
              {selectedTags.length > 0
                ? `${selectedTags.length} etiqueta${selectedTags.length > 1 ? "s" : ""}`
                : "Seleccionar etiquetas"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isTagsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu con animación (scale + opacity) */}
          <div
            id="etiquetas-list"
            role="listbox"
            className={`absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-[999]
                        transform origin-top-left transition-all duration-300 ${isTagsOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
          >
            {etiquetas.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">Cargando etiquetas...</p>
            ) : availableTags.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">Todas las etiquetas están seleccionadas</p>
            ) : (
              <div className="py-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id_etiqueta}
                    onClick={() => {
                      toggleTag(tag.nombre);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                    type="button"
                  >
                    {tag.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Etiquetas seleccionadas */}
        {selectedTags.length > 0 && (
          <div className="col-span-full">
            <p className="text-sm font-medium text-gray-600 mb-2">Etiquetas seleccionadas:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagName) => (
                <div
                  key={tagName}
                  className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 text-sm transition-all duration-200 transform hover:scale-105 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer"
                >
                  <span className="transition-opacity duration-200">{tagName}</span>
                  <button
                    onClick={() => removeTag(tagName)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                    aria-label={`Eliminar ${tagName}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="col-span-full flex items-center justify-start gap-2 mt-2">
          <button
            onClick={clearAll}
            disabled={isPending}
            className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm hover:bg-gray-50 disabled:opacity-60 transition transform active:scale-95"
            type="button"
          >
            Limpiar
          </button>
          <button
            onClick={apply}
            disabled={isPending}
            className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition transform active:scale-95"
            type="button"
          >
            Aplicar
          </button>
        </div>
      </div>
    </section>
  );
}