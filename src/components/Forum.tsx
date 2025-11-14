"use client";

import React, { useEffect, useState } from "react";
import LatestForums from "./LatestForums";
import MostViewedForums from "./MostViewedForums";
import ViewForums from "./ViewForums";
import ForumFilterbar, { ForumFilter } from "./ForumFilterbar";
import DetailForumCard, { type ForumDetail as DetailForum } from "./DetailForumCard";
import { mockFetchRespuestasByForo } from "./Forum.mocks";
import { X } from "lucide-react";

/**
 * Forum con pestañas (botones) para alternar secciones.
 * Ahora incluye ForumFilterbar en la pestaña "Todos" para filtrado dinámico.
 */
import MyForums from "./MyForums";

export default function Forum() {
  // por defecto mostramos "Todos" para que se vean los foros
  const [tab, setTab] = useState<"latest" | "most" | "all" | "mine">("all");

  // filtros aplicados (se pasan a ViewForums)
  const [filters, setFilters] = useState<ForumFilter | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  // estado para detalle en overlay
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailForum | null>(null);

  // NUEVO: userId reactivo para "Mis foros"
  const [userId, setUserId] = useState<number | null>(null);

  const handleApply = (next: ForumFilter) => {
    setIsPending(true);
    // simulamos breve latencia en la UI; ViewForums debe reaccionar al prop `filters`
    setFilters(next);
    // si tu ViewForums espera una llamada para recargar, aquí podrías triggerar esa llamada
    setTimeout(() => setIsPending(false), 250);
  };

  const handleReset = () => {
    setIsPending(true);
    setFilters(undefined);
    setTimeout(() => setIsPending(false), 150);
  };

  // helper para convertir una tarjeta a DetailForum
  const toDetail = (f: any): DetailForum => ({
    id_foro: f.id_foro,
    id_usuario: f.id_usuario,
    titulo: f.titulo,
    consulta: f.consulta,
    fecha: f.fecha,
    respuestas: Array.isArray(f.respuestas) ? f.respuestas : [],
    total_respuestas: Array.isArray(f.respuestas)
      ? f.respuestas.length
      : f.total_respuestas ?? 0,
    autor: f.autor ?? null,
  });


  // abrir modal detalle
  const openDetail = (foro: any) => {
    const id = Number(foro?.id_foro ?? foro?.id ?? foro?.foro_id);
    if (!id || Number.isNaN(id)) return;
    setSelectedId(id);
    setDetail(toDetail(foro));
    setIsOpen(true);
  };

  // cerrar modal
  const closeDetail = () => {
    setIsOpen(false);
    setSelectedId(null);
    setDetail(null);
    setError(null);
  };

  // NUEVO: leer userId desde localStorage (para "Mis foros") y mantenerlo actualizado
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readUserId = () => {
      try {
        const stored = window.localStorage.getItem("uid");
        if (!stored) {
          setUserId(null);
          return;
        }
        const parsed = Number(stored);
        if (Number.isInteger(parsed) && parsed > 0) {
          setUserId(parsed);
        } else {
          setUserId(null);
        }
      } catch {
        setUserId(null);
      }
    };

    readUserId();
    window.addEventListener("storage", readUserId);
    window.addEventListener("focus", readUserId);
    document.addEventListener("visibilitychange", readUserId);

    return () => {
      window.removeEventListener("storage", readUserId);
      window.removeEventListener("focus", readUserId);
      document.removeEventListener("visibilitychange", readUserId);
    };
  }, []);

  // cargar respuestas (por ahora con mocks, como dejaste)
  useEffect(() => {
    if (!isOpen || selectedId == null) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    mockFetchRespuestasByForo(selectedId)
      .then((resps) => {
        if (cancelled) return;
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                respuestas: resps,
                total_respuestas: Array.isArray(resps) ? resps.length : prev.total_respuestas,
              }
            : prev
        );
      })
      .catch(() => {
        // ignoramos errores de mock
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedId]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900">Foros de la comunidad</h2>
        <p className="text-sm text-slate-600">
          Encuentra preguntas, discusiones y consejos de otros usuarios.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("latest")}
          aria-pressed={tab === "latest"}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "latest"
              ? "bg-blue-600 text-white shadow"
              : "bg-white ring-1 ring-gray-200 text-slate-700 hover:bg-gray-50"
          }`}
        >
          Últimos
        </button>

        <button
          type="button"
          onClick={() => setTab("most")}
          aria-pressed={tab === "most"}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "most"
              ? "bg-blue-600 text-white shadow"
              : "bg-white ring-1 ring-gray-200 text-slate-700 hover:bg-gray-50"
          }`}
        >
          Más vistos
        </button>

        <button
          type="button"
          onClick={() => setTab("all")}
          aria-pressed={tab === "all"}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "all"
              ? "bg-blue-600 text-white shadow"
              : "bg-white ring-1 ring-gray-200 text-slate-700 hover:bg-gray-50"
          }`}
        >
          Todos
        </button>

        {/* NUEVO: pestaña "Mis foros" */}
        <button
          type="button"
          onClick={() => setTab("mine")}
          aria-pressed={tab === "mine"}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "mine"
              ? "bg-blue-600 text-white shadow"
              : "bg-white ring-1 ring-gray-200 text-slate-700 hover:bg-gray-50"
          }`}
        >
          Mis foros
        </button>
      </div>

      <div className="mt-4">
        {tab === "latest" && (
          <section aria-live="polite">
            <LatestForums onSelect={openDetail} />
          </section>
        )}

        {tab === "most" && (
          <section aria-live="polite">
            <MostViewedForums onSelect={openDetail} />
          </section>
        )}

        {tab === "all" && (
          <section aria-live="polite" className="space-y-4">
            <ForumFilterbar
              value={filters}
              onChange={() => {}}
              onApply={handleApply}
              onReset={handleReset}
              isPending={isPending}
              className="mb-2"
            />
            <ViewForums filters={filters} onSelect={openDetail} />
          </section>
        )}

        {/* NUEVO: sección "Mis foros" */}
        {tab === "mine" && (
          <section aria-live="polite">
            <MyForums
              userId={userId}
              onRequestLogin={() => {
                setTab("all");
                if (typeof window !== "undefined") {
                  window.location.href = "/auth/login";
                }
              }}
            />
          </section>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forum-detail-title"
        >
          <div className="absolute inset-0 bg-black/40" onClick={closeDetail} />
          <div className="relative z-10 w-full max-w-4xl rounded-xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b p-4">
              <h3 id="forum-detail-title" className="text-lg font-semibold text-slate-900">
                {detail?.titulo ?? "Detalle del foro"}
              </h3>
              <button
                onClick={closeDetail}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-5">
              {isLoading && !detail && (
                <div className="py-10 text-center text-sm text-slate-600">Cargando foro...</div>
              )}
              {detail && <DetailForumCard post={detail} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
