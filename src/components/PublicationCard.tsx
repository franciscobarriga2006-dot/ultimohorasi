"use client";

// 1. Importar useRef, useLayoutEffect y gsap
import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import api from "@/lib/api";
import { gsap } from "gsap"; 

type SearchParams = Record<string, string | string[] | null>;
type Scope = "all" | "mine";

type Publicacion = {
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
};

// ... (Las funciones clp, estadoStyle y tipoConfig no cambian)
const clp = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n)
    ? new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(n)
    : undefined;
};

const estadoStyle: Record<Publicacion["estado"], string> = {
  activa: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pausada: "bg-amber-50 text-amber-700 ring-amber-200",
  cerrada: "bg-gray-100 text-gray-700 ring-gray-300",
  eliminada: "bg-rose-50 text-rose-700 ring-rose-200",
};

const tipoConfig = {
  necesidad: {
    label: "Necesidad",
    gradient: "from-blue-600/30 via-cyan-400/30 to-purple-500/30",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  servicio: {
    label: "Servicio",
    gradient: "from-emerald-500/30 via-teal-400/30 to-sky-500/30",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};


export default function PublicationCard({
  searchParams,
  scope = "all",
}: {
  searchParams: SearchParams;
  scope?: Scope;
}) {
  const [items, setItems] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  
  // 2. Añadir el Ref para el contexto de GSAP
  const gridRef = useRef<HTMLDivElement>(null);

  const toggleFav = (id: number) =>
    setFavs((s) => ({ ...s, [id]: !s[id] }));

  // ... (El hook useMemo no cambia)
  const filters = useMemo(() => {
    const q = String(searchParams.q ?? "").toLowerCase();
    const tipo = String(searchParams.tipo ?? "").toLowerCase();
    const ciudad = String(searchParams.ciudad ?? "");
    const region = String(searchParams.region ?? "");
    const estado = String(searchParams.estado ?? "");
    const etiquetasStr = String(searchParams.etiquetas ?? "");
    const etiquetasArray = etiquetasStr
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const mine = scope === "mine" ? 1 : undefined;

    return {
      // Filtros que van al backend
      backend: {
        ...(q ? { q } : {}),
        ...(ciudad ? { ciudad } : {}),
        ...(region ? { region } : {}),
        ...(estado ? { estado } : {}),
        ...(mine ? { mine } : {}),
        limit: 100,
        offset: 0,
      },
      // Filtros que se aplican en frontend
      frontend: {
        tipo,
        etiquetas: etiquetasArray,
      },
    };
  }, [
    searchParams.q,
    searchParams.tipo,
    searchParams.ciudad,
    searchParams.region,
    searchParams.estado,
    searchParams.etiquetas,
    scope,
  ]);

  // ... (El useEffect de fetch no cambia)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErr(null);

    // Primero obtenemos todas las publicaciones según filtros backend
    api
      .get<{ items: Publicacion[]; limit: number; offset: number }>(
        "/publicaciones",
        {
          params: filters.backend,
          signal: controller.signal,
          withCredentials: true,
        }
      )
      .then(async ({ data }) => {
        let arr = Array.isArray(data?.items) ? data.items : [];

        // Si hay filtro de etiquetas, necesitamos obtener las etiquetas de cada publicación
        if (filters.frontend.etiquetas.length > 0) {
          const publicacionesConEtiquetas = await Promise.all(
            arr.map(async (pub) => {
              try {
                const res = await api.get(
                  `/publicaciones/${pub.id_publicacion}`
                );
                return {
                  ...pub,
                  etiquetas: res.data?.etiquetas || [],
                };
              } catch {
                return { ...pub, etiquetas: [] };
              }
            })
          );

          // Filtrar por etiquetas seleccionadas
          arr = publicacionesConEtiquetas.filter((pub: any) => {
            const pubEtiquetas = (pub.etiquetas || []).map((e: any) =>
              String(e.nombre).toLowerCase()
            );
            // La publicación debe tener al menos una de las etiquetas seleccionadas
            return filters.frontend.etiquetas.some((etiqueta) =>
              pubEtiquetas.includes(etiqueta.toLowerCase())
            );
          });
        }

        // FILTRADO FRONTEND: Excluir eliminadas y aplicar filtro de tipo
        arr = arr.filter((pub) => {
          // Siempre excluir publicaciones eliminadas
          if (pub.estado === "eliminada") return false;

          // Filtrar por tipo si está especificado
          if (filters.frontend.tipo) {
            const pubTipo = String(pub.tipo ?? "").toLowerCase();
            if (pubTipo !== filters.frontend.tipo) return false;
          }

          return true;
        });

        setItems(arr);
      })
      .catch((e: any) => {
        if (e.name === "CanceledError") return;
        setErr(String(e?.response?.data?.error ?? e?.message ?? "Error"));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filters]);

  // 3. Hook de animación GSAP
  useLayoutEffect(() => {
    // Solo animar si el ref existe
    if (!gridRef.current) return;

    // Crear un contexto de GSAP para la limpieza automática
    const ctx = gsap.context(() => {
      // Si está cargando, no hacer nada (se muestran los esqueletos)
      if (loading) {
        return;
      }

      // Animar el mensaje de error si existe
      if (err) {
        gsap.from(".error-message", {
          autoAlpha: 0, // autoAlpha = opacity + visibility
          y: 20,
          duration: 0.5,
          ease: "power3.out",
        });
        return;
      }

      // Animar el mensaje de "no hay items" si no hay items
      if (!items.length) {
        gsap.from(".no-items-message", {
          autoAlpha: 0,
          y: 20,
          duration: 0.9,
          ease: "power3.out",
        });
        return;
      }

      // Animar la entrada de las tarjetas
      gsap.from(".publication-card", {
        autoAlpha: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.2, // Animar una tras otra
        ease: "power3.out",
      });

    }, gridRef); // Alcance del contexto al ref

    // Función de limpieza
    return () => ctx.revert();
    
  }, [loading, items, err]); // Se ejecuta cada vez que estos estados cambian

  // El estado de carga (esqueletos) se maneja por separado
  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );

  // 4. Envolver el contenido principal con el gridRef
  //    y añadir clases 'invisible' a los elementos a animar
  return (
    <div ref={gridRef}>
      {err && (
        <p className="error-message invisible text-red-600">Error: {err}</p>
      )}

      {!err && !items.length && (
        <div className="no-items-message invisible text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay publicaciones disponibles
          </p>
          {Object.keys(searchParams).length > 0 && (
            <p className="text-gray-400 text-sm mt-2">
              Intenta ajustar los filtros de búsqueda
            </p>
          )}
        </div>
      )}

      {!err && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => {
            const tipoLower = (p.tipo ?? "").toLowerCase();
            const config =
              tipoLower === "servicio" ? tipoConfig.servicio : tipoConfig.necesidad;

            return (
              <article
                key={p.id_publicacion}
                // Añadir 'publication-card' e 'invisible'
                className={`publication-card invisible group relative rounded-2xl p-[1px] bg-gradient-to-tr ${config.gradient}`}
              >
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 h-full">
                  {/*header*/}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold leading-tight line-clamp-2">
                      {p.titulo}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs ring ${
                          estadoStyle[p.estado]
                        }`}
                      >
                        {p.estado}
                      </span>

                      {/* Botón Favoritos (solo UI local) */}
                      <button
                        type="button"
                        onClick={() => toggleFav(p.id_publicacion)}
                        aria-pressed={!!favs[p.id_publicacion]}
                        title={favs[p.id_publicacion] ? "Quitar de favoritos" : "Agregar a favoritos"}
                        className={`rounded-full p-1.5 ring-1 transition
                          ${favs[p.id_publicacion]
                            ? "bg-rose-50 text-rose-600 ring-rose-200"
                            : "bg-white text-gray-400 ring-gray-200 hover:text-rose-600 hover:ring-rose-200"
                          }`}
                      >
                        <span className="sr-only">Favoritos</span>
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={favs[p.id_publicacion] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M21 8.25c0-2.49-2.1-4.5-4.69-4.5-1.94 0-3.6 1.13-4.31 2.73-.72-1.6-2.38-2.73-4.31-2.73C5.1 3.75 3 5.76 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subheader */}
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 ring-1 ${config.badge}`}
                    >
                      {config.label}
                    </span>
                    {(p.ciudad || p.region) && (
                      <span className="text-gray-600">
                        📍 {p.ciudad}
                        {p.region ? `, ${p.region}` : ""}
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                    {p.descripcion}
                  </p>

                  {/* Meta grid */}
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    {p.monto != null && (
                      <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
                        <dt className="text-xs text-gray-500">Monto</dt>
                        <dd className="font-medium">{clp(p.monto) ?? "—"}</dd>
                      </div>
                    )}
                    {p.horas && (
                      <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200">
                        <dt className="text-xs text-gray-500">Horas</dt>
                        <dd className="font-medium">{p.horas}</dd>
                      </div>
                    )}
                    {p.direccion && (
                      <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200 col-span-2">
                        <dt className="text-xs text-gray-500">Dirección</dt>
                        <dd className="font-medium truncate">{p.direccion}</dd>
                      </div>
                    )}
                    {p.horario && (
                      <div className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200 col-span-2">
                        <dt className="text-xs text-gray-500">Horario</dt>
                        <dd className="font-medium">{p.horario}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {(p.created_at &&
                        new Date(p.created_at).toLocaleDateString("es-CL")) ||
                        ""}
                    </span>
                    <button
                      onClick={() =>
                        (window.location.href = `/publications/publications_detail?id=${p.id_publicacion}`)
                      }
                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      type="button"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}