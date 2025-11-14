"use client";

// 1. Importar useRef, useLayoutEffect y GSAP (incluyendo Flip)
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip"; // Importar el plugin Flip

interface Postulacion {
  id_postulacion: number;
  id_publicacion: number;
  publicacion_titulo: string;
  mensaje?: string;
  estado_postulacion: "pendiente" | "aceptada" | "rechazada";
  fecha: string;
  publicacion_ciudad?: string;
  publicacion_region?: string;
}

const estadoStyle: Record<Postulacion["estado_postulacion"], string> = {
  pendiente: "bg-amber-50 text-amber-700 ring-amber-200",
  aceptada: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rechazada: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function MyPostulationCard() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [limit] = useState<number>(9);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const searchParams = useSearchParams();

  // 2. Crear Refs para GSAP
  const containerRef = useRef<HTMLDivElement>(null); // Contenedor principal
  const gridRef = useRef<HTMLDivElement>(null); // Contenedor de la grilla

  // 3. Registrar el plugin Flip
  useLayoutEffect(() => {
    gsap.registerPlugin(Flip);
  }, []);

  // Hook de fetching (sin cambios)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErr(null);

    const params: Record<string, any> = { limit, offset };
    const p_q = searchParams?.get("p_q") ?? "";
    const p_estado = searchParams?.get("p_estado");
    const p_fecha = searchParams?.get("p_fecha");

    if (p_estado) params.estado_postulacion = p_estado;
    if (p_fecha) params.fecha = p_fecha;

    api
      .get<{ items: Postulacion[] }>("/mis_postulaciones", {
        params,
        signal: controller.signal,
        withCredentials: true,
      })
      .then(({ data }) => {
        let arr = Array.isArray(data?.items) ? data.items : [];

        // ... (Filtrado en cliente sin cambios) ...
        if (p_estado) {
          const est = String(p_estado).toLowerCase();
          arr = arr.filter(
            (it) => String(it.estado_postulacion ?? "").toLowerCase() === est
          );
        }
        if (p_fecha) {
          const wanted = String(p_fecha);
          arr = arr.filter((it) => {
            try {
              const d = new Date(it.fecha);
              if (Number.isNaN(d.getTime())) return false;
              const isoDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
              return isoDate === wanted;
            } catch {
              return false;
            }
          });
        }
        if (p_q) {
          const qlow = String(p_q).toLowerCase();
          arr = arr.filter((it) =>
            String(it.publicacion_titulo ?? "").toLowerCase().includes(qlow)
          );
        }

        setPostulaciones(arr);
        setHasMore(Array.isArray(arr) ? arr.length === limit : false);
      })
      .catch((e: any) => {
        if (e.name === "CanceledError") return;
        setErr(String(e?.response?.data?.error ?? e?.message ?? "Error"));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [searchParams?.toString(), offset, limit]);

  // 4. Hook de Animación de Carga y Estado (Stagger)
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Usar contexto de GSAP para limpieza automática
    const ctx = gsap.context(() => {
      // No animar si está cargando
      if (loading) return;

      // Animar error
      if (err) {
        gsap.from(".error-message", {
          autoAlpha: 0,
          y: 20,
          duration: 0.5,
          ease: "power3.out",
        });
        return;
      }

      // Animar mensaje vacío
      if (!postulaciones.length) {
        gsap.from(".empty-message", {
          autoAlpha: 0,
          y: 20,
          duration: 0.5,
          ease: "power3.out",
        });
        return;
      }

      // Animar la grilla de tarjetas
      gsap.from(".postulation-card", {
        autoAlpha: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.08, // La magia del escalonado
        ease: "power3.out",
      });
      
    }, containerRef); // Limitar al contenedor principal

    return () => ctx.revert(); // Limpieza
  }, [loading, postulaciones, err]); // Se ejecuta cuando estos estados cambian

  // Confirm / delete (sin cambios)
  const confirmDelete = async (id: number, title?: string) => {
    const ok = window.confirm(
      `¿Eliminar tu postulación${title ? ` a "${title}"` : ""}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    await performDelete(id);
  };

  // 5. Modificar 'performDelete' para usar Flip
  const performDelete = async (id: number) => {
    if (!gridRef.current) return;
    
    const card = gridRef.current.querySelector(
      `[data-postulation-id="${id}"]`
    );
    if (!card) return;

    try {
      setDeletingId(id);

      // 1. Capturar el estado actual de la grilla
      const state = Flip.getState(gridRef.current.children);

      // 2. Animar la tarjeta para que desaparezca
      await gsap.to(card, {
        autoAlpha: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in",
      });
      
      // 3. Ocultar la tarjeta (display: none) para que Flip la vea como "desaparecida"
      gsap.set(card, { display: "none" });

      // 4. Animar las tarjetas restantes a su nueva posición
      Flip.from(state, {
        duration: 0.5,
        ease: "power3.out",
        targets: gridRef.current.children,
      });

      // 5. Hacer la llamada a la API y actualizar el estado de React *después* de la animación
      await api.delete(`/postulaciones/${id}`, { withCredentials: true });
      setPostulaciones((prev) => prev.filter((p) => p.id_postulacion !== id));
      
    } catch (e: any) {
      setErr(String(e?.response?.data?.error ?? e?.message ?? "Error al eliminar"));
      // Si falla, volver a mostrar la tarjeta
      gsap.to(card, { autoAlpha: 1, scale: 1, duration: 0.3 });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );

  // 6. Añadir 'ref' y clases de animación al JSX
  return (
    // Cambiar <> por <div> y añadir 'containerRef'
    <div ref={containerRef}>
      {err && (
        <p className="error-message invisible text-red-600">Error: {err}</p>
      )}

      {!err && !postulaciones.length && (
        <div className="empty-message invisible text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchParams?.toString()
              ? "No hay postulaciones con esos filtros"
              : "No tienes postulaciones aún"}
          </p>
          {!searchParams?.toString() && (
            <p className="text-gray-400 text-sm mt-2">
              Explora las publicaciones disponibles y postúlate
            </p>
          )}
        </div>
      )}

      {/* Cards de postulaciones */}
      <div
        ref={gridRef} // Añadir 'gridRef' a la grilla
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {postulaciones.map((p) => (
          <article
            key={p.id_postulacion}
            // Añadir ID para Flip y clases para GSAP
            data-postulation-id={p.id_postulacion}
            className="postulation-card invisible group relative rounded-2xl p-[1px] bg-gradient-to-tr from-blue-600/30 via-cyan-400/30 to-purple-500/30"
          >
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight line-clamp-2">
                  {p.publicacion_titulo}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ring ${
                    estadoStyle[p.estado_postulacion]
                  }`}
                >
                  {p.estado_postulacion}
                </span>
              </div>

              {/* Ubicación */}
              {(p.publicacion_ciudad || p.publicacion_region) && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    📍 {p.publicacion_ciudad}
                    {p.publicacion_region ? `, ${p.publicacion_region}` : ""}
                  </span>
                </div>
              )}

              {/* Mensaje */}
              {p.mensaje && (
                <div className="mt-3 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200 flex-grow">
                  <dt className="text-xs text-gray-500 mb-1">Tu mensaje:</dt>
                  <dd className="text-sm text-gray-700 line-clamp-3">{p.mensaje}</dd>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(p.fecha).toLocaleDateString("es-CL")}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      (window.location.href = `/publications/publications_detail?id=${p.id_publicacion}`)
                    }
                    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    type="button"
                  >
                    Ver publicación
                  </button>
                  <button
                    className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                    type="button"
                    onClick={() => confirmDelete(p.id_postulacion, p.publicacion_titulo)}
                    disabled={deletingId === p.id_postulacion}
                    aria-label={`Eliminar postulación ${p.id_postulacion}`}
                  >
                    {deletingId === p.id_postulacion ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Paginación (sin animación, ya que la carga maneja la transición) */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
          disabled={offset === 0}
          className="h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          type="button"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-600 font-medium px-3">
          Página {offset / limit + 1}
        </span>
        <button
          onClick={() => setOffset((o) => o + limit)}
          disabled={!hasMore}
          className="h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          type="button"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}