// componente DetailForumCard.tsx
"use client";

import { useEffect, useState } from "react";

export type ForoBase = {
  id_foro: number;
  id_usuario: number;
  titulo: string;
  consulta: string;
  fecha: string; // ISO DATETIME(3)
};

export type ForoAutor = {
  id_usuario: number;
  nombres?: string | null;
  apellidos?: string | null;
  rol?: "admin" | "empleador" | "trabajador" | null;
};

export type RespuestaForo = {
  id_respuesta: number;
  id_foro: number;
  id_usuario: number;
  respuesta: string;
  fecha: string; // ISO DATETIME(3)
  autor?: ForoAutor;
};

export type ForumDetail = ForoBase & {
  autor?: ForoAutor;
  total_respuestas?: number;
  respuestas?: RespuestaForo[];
};

/* ===========================================================
   Helper local para formatear fechas
   =========================================================== */
function fmt(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// Mock sencillo: en ausencia de auth real, leemos un userId desde localStorage
function getUserId(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem("userId");
  return raw ? Number(raw) : 1; // <- ajusta si usas otro origen de identidad
}

/* ===========================================================
   Componente: muestra título, autor, fecha, consulta y respuestas
   =========================================================== */
export default function DetailForumCard({ post }: { post: ForumDetail }) {
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estado local para respuestas (para poder hacer append al publicar)
  const [respuestasLocal, setRespuestasLocal] = useState<RespuestaForo[]>(
    post.respuestas ?? []
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si cambia el foro, re-sincroniza las respuestas locales
  useEffect(() => {
    setRespuestasLocal(post.respuestas ?? []);
    setError(null);
    setMostrarFormulario(false);
    setNuevaRespuesta("");
  }, [post.id_foro, post.respuestas]);

  const nombreAutor =
    post.autor?.nombres || post.autor?.apellidos
      ? `${post.autor?.nombres ?? ""} ${post.autor?.apellidos ?? ""}`.trim()
      : null;

  const handleSubmitRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    const payload = nuevaRespuesta.trim();
    if (!payload) return;

    setEnviando(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const res = await fetch(`${API_BASE}/foros/${post.id_foro}/respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": String((typeof window !== "undefined" && (localStorage.getItem("uid") || localStorage.getItem("userId") || "")) || getUserId()) },
        body: JSON.stringify({
          id_usuario: getUserId(),      // <- el backend lo espera así
          respuesta: payload,           // <- el texto de la respuesta
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        // Fallback: si el foro no existe en BD (ej. IDs mock), añadimos localmente
        if (res.status === 404) {
          const nuevaLocal: RespuestaForo = {
            id_respuesta: Date.now(),
            id_foro: post.id_foro,
            id_usuario: getUserId(),
            respuesta: payload,
            fecha: new Date().toISOString(),
            autor: { id_usuario: getUserId(), nombres: null, apellidos: null, rol: null },
          };
          setRespuestasLocal((prev) => [nuevaLocal, ...prev]);
          setNuevaRespuesta("");
          setMostrarFormulario(false);
          return;
        }
        throw new Error(data?.error || "No se pudo publicar la respuesta");
      }

      // Mapeo defensivo según lo que devuelva tu controlador:
      const nueva: RespuestaForo = {
        id_respuesta: data.id_respuesta,
        id_foro: data.id_foro ?? post.id_foro,
        id_usuario: data.id_usuario ?? getUserId(),
        respuesta: data.respuesta ?? payload,
        fecha: data.fecha || new Date().toISOString(),
        autor: {
          id_usuario: data.id_usuario ?? getUserId(),
          nombres: data.autor_nombres ?? null,
          apellidos: data.autor_apellidos ?? null,
          rol: null,
        },
      };

      // prepend correcto
      setRespuestasLocal((prev) => [nueva, ...prev]);

      setNuevaRespuesta("");
      setMostrarFormulario(false);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al enviar la respuesta");
    } finally {
      setEnviando(false);
    }
  };


  const respuestas = respuestasLocal;
  const totalRespuestas = respuestas.length;

  return (
    <div className="space-y-6">
      {/* Pregunta principal del foro */}
      <article className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              {post.titulo}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {nombreAutor && (
                <span className="font-medium text-gray-800">{nombreAutor}</span>
              )}
              {post.autor?.rol && (
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                  {post.autor.rol}
                </span>
              )}
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{fmt(post.fecha)}</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
            💬 {totalRespuestas}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-800">
          {post.consulta}
        </p>
      </article>

      {/* Errores de envío */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Sección de respuestas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {totalRespuestas === 0
              ? "Sin respuestas aún"
              : totalRespuestas === 1
              ? "1 Respuesta"
              : `${totalRespuestas} Respuestas`}
          </h3>

          {!mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={enviando}
            >
              Responder
            </button>
          )}
        </div>

        {/* Formulario para nueva respuesta */}
        {mostrarFormulario && (
          <form
            onSubmit={handleSubmitRespuesta}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <label
              htmlFor="nueva-respuesta"
              className="block text-sm font-medium text-gray-700"
            >
              Tu respuesta
            </label>
            <textarea
              id="nueva-respuesta"
              value={nuevaRespuesta}
              onChange={(e) => setNuevaRespuesta(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="Escribe tu respuesta aquí..."
              required
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setNuevaRespuesta("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={enviando}
              >
                {enviando ? "Publicando..." : "Publicar respuesta"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de respuestas */}
        {respuestas.length > 0 ? (
          <div className="space-y-3">
            {respuestas.map((resp) => {
              const nombreAutorResp =
                resp.autor?.nombres || resp.autor?.apellidos
                  ? `${resp.autor?.nombres ?? ""} ${
                      resp.autor?.apellidos ?? ""
                    }`.trim()
                  : `Usuario #${resp.id_usuario}`;

              return (
                <article
                  key={resp.id_respuesta}
                  className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                        {nombreAutorResp.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {nombreAutorResp}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {resp.autor?.rol && (
                            <>
                              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                                {resp.autor.rol}
                              </span>
                              <span>·</span>
                            </>
                          )}
                          <span>{fmt(resp.fecha)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {resp.respuesta}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xl">💬</span>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-700">
              Aún no hay respuestas
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Sé el primero en responder a esta consulta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
