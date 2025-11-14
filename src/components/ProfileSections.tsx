"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

// === NUEVO: Framer Motion ===
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  Variants,
  Transition,
} from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]; // ≈ easeOut

const makeFadeUp = (rm: boolean): Variants => {
  const tx: Transition = rm
    ? { duration: 0 }
    : { duration: 0.35, ease: EASE_OUT };
  return {
    hidden: { opacity: 0, y: rm ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: tx },
  };
};

const makeList = (rm: boolean, stagger = 0.05): Variants => ({
  hidden: {},
  show: {
    transition: rm
      ? { duration: 0 }
      : { staggerChildren: stagger, delayChildren: 0.03 },
  },
});

const makeItem = (rm: boolean): Variants => {
  const tx: Transition = rm
    ? { duration: 0 }
    : { duration: 0.35, ease: EASE_OUT };
  return {
    hidden: { opacity: 0, y: rm ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: tx },
  };
};

// Sección de Publicaciones
export function PublicacionesSection() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rm = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPublicaciones = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener publicaciones del usuario loggeado usando mine=1
        const res = await api.get("/publicaciones", {
          params: {
            limit: 20,
            offset: 0,
            mine: 1, // <- Parámetro que indica "solo mis publicaciones"
          },
          signal: controller.signal,
          withCredentials: true, // Importante para enviar las cookies
        });

        setPublicaciones(Array.isArray(res.data.items) ? res.data.items : []);
      } catch (e: any) {
        if (e.name !== "CanceledError") {
          console.error("Error cargando publicaciones", e);
          setError(
            String(
              e?.response?.data?.error ??
                e?.message ??
                "Error al cargar publicaciones"
            )
          );
          setPublicaciones([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();

    return () => controller.abort();
  }, []);

  const wrap = makeFadeUp(rm);
  const list = makeList(rm);
  const item = makeItem(rm);

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6"
        variants={item}
      >
        Mis Publicaciones
      </motion.h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="pub-loading"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando publicaciones...
          </motion.div>
        ) : error ? (
          <motion.div
            key="pub-error"
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-red-600 mb-2">{error}</div>
            <p className="text-sm text-gray-500">
              {error.includes("No autenticado")
                ? "Por favor, inicia sesión para ver tus publicaciones."
                : "Intenta recargar la página."}
            </p>
          </motion.div>
        ) : publicaciones.length === 0 ? (
          <motion.div
            key="pub-empty"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg
              className="mx-auto w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mb-2">No tienes publicaciones aún.</p>
            <p className="text-sm">
              Crea tu primera publicación para comenzar a recibir postulaciones.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="pub-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={list}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            {publicaciones.map((pub: any, index: number) => (
              <motion.article
                key={pub.id_publicacion ?? `pub-${index}`}
                className="border rounded-lg p-4 hover:shadow-md transition group"
                variants={item}
                whileHover={rm ? {} : { scale: 1.02 }}
                whileTap={rm ? {} : { scale: 0.97 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                    {pub.titulo || "Sin título"}
                  </h3>
                  {pub.estado && (
                    <span
                      className={`ml-2 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        pub.estado === "activa"
                          ? "bg-green-100 text-green-700"
                          : pub.estado === "cerrada"
                          ? "bg-gray-100 text-gray-700"
                          : pub.estado === "pausada"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pub.estado}
                    </span>
                  )}
                </div>

                {pub.descripcion && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {pub.descripcion}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs">
                  <div className="text-gray-500">
                    {(pub.ciudad || pub.region) && (
                      <span>
                        📍 {[pub.ciudad, pub.region].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pub.monto != null && (
                      <span className="font-semibold text-gray-800">
                        {new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          maximumFractionDigits: 0,
                        }).format(pub.monto)}
                      </span>
                    )}

                    <a
                      href={`/publications/publications_view?id=${pub.id_publicacion}`}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                    >
                      Ver
                    </a>
                  </div>
                </div>

                {pub.created_at && (
                  <div className="text-xs text-gray-400 mt-2">
                    Creada el{" "}
                    {new Date(pub.created_at).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface Postulacion {
  id_postulacion: number;
  id_publicacion: number;
  id_postulante: number;
  mensaje: string | null;
  estado_postulacion: "pendiente" | "aceptada" | "rechazada";
  fecha: string;
  publicacion_titulo: string;
  publicacion_estado: string;
  publicacion_tipo: string;
  publicacion_monto: number;
  postulante_nombres: string;
  postulante_apellidos: string;
  postulante_correo: string;
}

interface ApiResponse {
  items: Postulacion[];
  total: number;
  limit: number;
  offset: number;
  userId: number;
}

// Sección de Postulaciones (NUEVO)
export function PostulacionesSection() {
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rm = useReducedMotion();
  const [actorId, setActorId] = useState<number | null>(null);

    async function createChatBetween({
      creatorId,
      postulanteId,
      // idPublicacion ya no es necesario para esta llamada,
      // la tabla 'Chats' no lo tiene
    }: {
      creatorId: number;
      postulanteId: number;
      idPublicacion: number;
    }) {
      // Validaciones básicas
      if (!creatorId || !postulanteId) {
        console.warn("createChatBetween: IDs de usuario inválidos", {
          creatorId,
          postulanteId,
        });
        return null;
      }

      const u1 = Number(creatorId);
      const u2 = Number(postulanteId);

      // === INICIO DE LA SOLUCIÓN ===

      const payload = {
        // 2. CORRECCIÓN: El controller espera 'userA' y 'userB'
        userA: u1,
        userB: u2,
        // No enviamos id_publicacion, la tabla 'Chats' no lo tiene
      };

      // === FIN DE LA SOLUCIÓN ===

      try {
        // 1. CORRECCIÓN: La ruta es "/chats" (plural)
        const res = await api.post("/chats", payload, {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": String(creatorId),
          },
          withCredentials: true,
        });

        // El controller devuelve 200 si ya existe
        // o 201 si es nuevo. En ambos casos, es un éxito.
        console.info("Chat creado o ya existente (200/201 OK):", res.data);
        return res.data ?? null;

      } catch (e: any) {
        // Este bloque 'catch' está perfecto.
        console.error(
          "POST /chats error. Payload enviado:",
          payload,
          "Error Completo:",
          e
        );

        const status = e?.response?.status;
        const msg = e?.response?.data?.error || e?.message || "Fallo POST /chats";

        // NOTA: Ya no necesitamos el 'if (status === 409)'
        // porque el controller maneja eso y devuelve 200.
        // Un error aquí será un 400 (mal request), 403 (bloqueado) o 500.
        throw new Error(msg);
      }
    }


    useEffect(() => {
    let active = true;                       // ← evita setState tras unmount
    const controller = new AbortController();

    const fetchPostulaciones = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/postulaciones_recibidas", {
          params: { limit: 50, offset: 0 },
          signal: controller.signal,
          withCredentials: true,
        });

        if (!active) return;

        // userId defensivo por si cambia el nombre en backend
        const fromApi =
          Number(res?.data?.userId ?? res?.data?.id_usuario ?? res?.data?.uid ?? 0) || null;

        if (fromApi) {
          setActorId(fromApi);
        } else if (typeof window !== "undefined") {
          const raw = localStorage.getItem("uid") || localStorage.getItem("userId");
          const parsed = raw ? Number(raw) : NaN;
          setActorId(Number.isInteger(parsed) && parsed > 0 ? parsed : null);
        }

        setPostulaciones(Array.isArray(res?.data?.items) ? res.data.items : []);
      } catch (e: any) {
        const isCanceled = e?.name === "CanceledError" || e?.code === "ERR_CANCELED";
        if (!isCanceled && active) {
          console.error("Error cargando postulaciones recibidas", e);
          setError(String(e?.response?.data?.error ?? e?.message ?? "Error al cargar postulaciones"));
          setPostulaciones([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPostulaciones();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);



  const wrap = makeFadeUp(rm);
  const list = makeList(rm);
  const item = makeItem(rm);

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6"
        variants={item}
      >
        Postulaciones Recibidas
      </motion.h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="post-loading"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando postulaciones...
          </motion.div>
        ) : error ? (
          <motion.div
            key="post-error"
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-red-600 mb-2">{error}</div>
            <p className="text-sm text-gray-500">
              {error.includes("No autenticado")
                ? "Por favor, inicia sesión para ver las postulaciones."
                : "Intenta recargar la página."}
            </p>
          </motion.div>
        ) : postulaciones.length === 0 ? (
          <motion.div
            key="post-empty"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg
              className="mx-auto w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mb-2">No has recibido postulaciones aún.</p>
            <p className="text-sm">
              Las postulaciones que reciban tus publicaciones aparecerán aquí.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="post-list"
            className="space-y-4"
            variants={list}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            {postulaciones.map((post: any, index: number) => {
              const nombreCompleto = `${post.postulante_nombres || ""} ${
                post.postulante_apellidos || ""
              }`.trim();
              const iniciales = nombreCompleto
                ? nombreCompleto
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s) => s.charAt(0))
                    .join("")
                    .toUpperCase()
                : "U";

              return (
                <motion.article
                  key={post.id_postulacion ?? `post-${index}`}
                  className="border rounded-lg p-5 hover:shadow-lg transition"
                  variants={item}
                  whileHover={rm ? {} : { scale: 1.01 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                          {iniciales}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {nombreCompleto || "Usuario"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Postulación para: {post.publicacion_titulo}
                          </p>
                        </div>
                        {post.estado_postulacion && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              post.estado_postulacion === "pendiente"
                                ? "bg-yellow-100 text-yellow-700"
                                : post.estado_postulacion === "aceptada"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {post.estado_postulacion}
                          </span>
                        )}
                      </div>

                      {post.mensaje && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 mb-3">
                          "{post.mensaje}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {post.postulante_correo && (
                          <span className="text-gray-600">
                            📧 {post.postulante_correo}
                          </span>
                        )}
                        {post.publicacion_monto != null && (
                          <span className="font-semibold text-indigo-600">
                            {new Intl.NumberFormat("es-CL", {
                              style: "currency",
                              currency: "CLP",
                              maximumFractionDigits: 0,
                            }).format(post.publicacion_monto)}
                          </span>
                        )}
                        {post.fecha && (
                          <span className="text-gray-400 text-xs ml-auto">
                            {new Date(post.fecha).toLocaleDateString("es-CL", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {/* === BOTONES ACEPTAR / RECHAZAR === */}
                        <div className="flex justify-end gap-2 mt-4">
                          {post.estado_postulacion === "pendiente" && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    // 1) Cambiar a "aceptada"
                                    await api.patch(
                                    `/postulaciones/${post.id_postulacion}`,
                                    { estado_postulacion: "aceptada" },
                                    {
                                      withCredentials: true,
                                      headers: actorId ? { "x-user-id": String(actorId) } : undefined,
                                    }
                                  );

                                    setPostulaciones((prev) =>
                                      prev.map((p) =>
                                        p.id_postulacion === post.id_postulacion
                                          ? { ...p, estado_postulacion: "aceptada" }
                                          : p
                                      )
                                    );

                                    // 2) Crear chat entre creador (actorId) y postulante aceptado
                                    const creator = actorId ??
                                      (typeof window !== "undefined"
                                        ? Number(
                                            (window.localStorage.getItem("uid") ||
                                              window.localStorage.getItem("userId")) ?? 0
                                          )
                                        : 0);

                                    if (creator && post?.id_postulante && post?.id_publicacion) {
                                      await createChatBetween({
                                        creatorId: creator,
                                        postulanteId: Number(post.id_postulante),
                                        idPublicacion: Number(post.id_publicacion),
                                      });
                                    } else {
                                      console.warn("Faltan datos para crear chat", {
                                        creator,
                                        postulante: post?.id_postulante,
                                        publicacion: post?.id_publicacion,
                                      });
                                    }
                                  } catch (e) {
                                    console.error("Error aceptando/creando chat", e);
                                    // opcional: muestra un toast o setError(...) si quieres notificar en UI
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Aceptar
                              </button>


                              <button
                                onClick={async () => {
                                  try {
                                    await api.patch(`/postulaciones/${post.id_postulacion}`, {
                                      estado_postulacion: "rechazada"
                                    });
                                    setPostulaciones(prev =>
                                      prev.map(p =>
                                        p.id_postulacion === post.id_postulacion
                                          ? { ...p, estado_postulacion: "rechazada" }
                                          : p
                                      )
                                    );
                                  } catch (e) {
                                    console.error("Error rechazando", e);
                                  }
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Sección de Pendientes
export function PendientesSection() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const rm = useReducedMotion();

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const res = await api.get("/mis_postulaciones", {
          params: { limit: 20, offset: 0 },
        });
        setPendientes(Array.isArray(res.data.items) ? res.data.items : []);
      } catch (e) {
        console.error("Error cargando pendientes", e);
        setPendientes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPendientes();
  }, []);

  const wrap = makeFadeUp(rm);
  const list = makeList(rm);
  const item = makeItem(rm);

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6"
        variants={item}
      >
        Postulaciones Pendientes
      </motion.h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="pend-loading"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando postulaciones...
          </motion.div>
        ) : pendientes.length === 0 ? (
          <motion.div
            key="pend-empty"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No tienes postulaciones pendientes.
          </motion.div>
        ) : (
          <motion.div
            key="pend-list"
            className="space-y-3"
            variants={list}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            {pendientes.map((pend: any, index: number) => (
              <motion.article
                key={pend.id ?? `pend-${index}`}
                className="border rounded-lg p-4 hover:shadow-md transition"
                variants={item}
                whileHover={rm ? {} : { scale: 1.01 }}
                whileTap={rm ? {} : { scale: 0.98 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      {pend.publicacion_titulo || pend.titulo || "Sin título"}
                    </h3>
                    {pend.mensaje && (
                      <p className="text-xs text-gray-600 mb-2">
                        {pend.mensaje}
                      </p>
                    )}
                    {pend.estado && (
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full ${
                          pend.estado === "aceptada"
                            ? "bg-green-100 text-green-700"
                            : pend.estado === "rechazada"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {pend.estado}
                      </span>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    {pend.monto != null && (
                      <p className="font-semibold text-sm mb-2">
                        {new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          maximumFractionDigits: 0,
                        }).format(pend.monto)}
                      </p>
                    )}
                    {pend.id_publicacion && (
                      <a
                        href={`/publications/publications_view?id=${pend.id_publicacion}`}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 inline-block"
                      >
                        Ver publicación
                      </a>
                    )}
                    {pend.created_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(pend.created_at).toLocaleDateString("es-CL")}
                      </p>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Sección de Favoritos
export function FavoritosSection() {
  const rm = useReducedMotion();
  const wrap = makeFadeUp(rm);
  const item = makeItem(rm);

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6"
        variants={item}
      >
        Favoritos
      </motion.h2>
      <motion.div
        className="text-center text-gray-500 py-12"
        variants={item}
        initial="hidden"
        animate="show"
      >
        <svg
          className="mx-auto w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <p>No tienes publicaciones guardadas en favoritos.</p>
        <p className="text-sm mt-2">
          Guarda publicaciones que te interesen para encontrarlas fácilmente.
        </p>
      </motion.div>
    </motion.div>
  );
}

// Sección de Historial
export function HistorialSection() {
  const rm = useReducedMotion();
  const wrap = makeFadeUp(rm);
  const item = makeItem(rm);

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6"
        variants={item}
      >
        Historial
      </motion.h2>
      <motion.div
        className="text-center text-gray-500 py-12"
        variants={item}
        initial="hidden"
        animate="show"
      >
        <svg
          className="mx-auto w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>Tu historial de actividades aparecerá aquí.</p>
        <p className="text-sm mt-2">
          Revisa tus trabajos completados y transacciones pasadas.
        </p>
      </motion.div>
    </motion.div>
  );
}

type RolUsuario = "admin" | "empleador" | "trabajador";
type BlockedRecord = {
  id_usuario: number;
  id_bloqueado: number;
  fecha: string;
  bloqueado: {
    id_usuario: number;
    rut: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: RolUsuario;
    estado?: 0 | 1;
  };
};

const blockedFallback: BlockedRecord[] = [
  {
    id_usuario: 5,
    id_bloqueado: 2,
    fecha: "2024-05-10T09:30:00.000Z",
    bloqueado: {
      id_usuario: 2,
      rut: "18.345.678-9",
      nombres: "Benjamín",
      apellidos: "Rojas",
      correo: "benjamin.rojas@example.com",
      rol: "trabajador",
      estado: 1,
    },
  },
  {
    id_usuario: 2,
    id_bloqueado: 5,
    fecha: "2024-05-11T11:12:00.000Z",
    bloqueado: {
      id_usuario: 5,
      rut: "17.654.321-0",
      nombres: "Camila",
      apellidos: "Muñoz",
      correo: "camila.munoz@example.com",
      rol: "empleador",
      estado: 1,
    },
  },
];

// Sección de Bloqueados
export function BloqueadosSection() {
  const [items, setItems] = useState<BlockedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const rm = useReducedMotion();

  useEffect(() => {
    // Mock inmediato
    setItems(blockedFallback);
    setLoading(false);
  }, []);

  const wrap = makeFadeUp(rm);
  const list = makeList(rm);
  const item = makeItem(rm);

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6"
        variants={item}
      >
        Usuarios bloqueados
      </motion.h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="blk-loading"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando...
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="blk-empty"
            className="text-center text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No tienes usuarios bloqueados en este momento. Los usuarios que
            agregues a la lista no podrán enviarte mensajes ni postular a tus
            publicaciones.
          </motion.div>
        ) : (
          <motion.div
            key="blk-list"
            className="space-y-4"
            variants={list}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            {items.map((registro) => {
              const p = registro.bloqueado;
              const nombre =
                `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim() ||
                "Usuario bloqueado";
              const iniciales =
                nombre
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s) => s.charAt(0))
                  .join("")
                  .toUpperCase() || "U";
              const rolLabel = p?.rol
                ? p.rol.charAt(0).toUpperCase() + p.rol.slice(1)
                : "Usuario";

              return (
                <motion.article
                  key={`${registro.id_usuario}-${registro.id_bloqueado}`}
                  className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm"
                  variants={item}
                  whileHover={rm ? {} : { scale: 1.01 }}
                  whileTap={rm ? {} : { scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100 text-sm font-semibold text-rose-600">
                      {iniciales}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-sm font-semibold text-gray-800">
                          {nombre}
                        </h5>
                        {p?.rol && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                            {rolLabel}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-gray-400">
                          Desde{" "}
                          {new Date(registro.fecha).toLocaleDateString(
                            "es-CL",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <dl className="space-y-1 text-xs text-gray-500">
                        {p?.rut && (
                          <div>
                            <span className="font-medium text-gray-600">
                              RUT:
                            </span>{" "}
                            {p.rut}
                          </div>
                        )}
                        {p?.correo && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Correo:
                            </span>{" "}
                            {p.correo}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-600">
                            ID bloqueado:
                          </span>{" "}
                          {registro.id_bloqueado}
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-600">
                          ID usuario:
                        </span>{" "}
                        {registro.id_usuario}
                        <button
                          type="button"
                          className="rounded-md border border-rose-200 px-3 py-1 font-medium text-rose-600 transition hover:bg-rose-50"
                          data-blocked-id={registro.id_bloqueado}
                        >
                          Desbloquear
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type PerfilOut = {
  id_usuario: number;
  rut: string;
  nombres: string;
  apellidos: string;
  correo: string;
  Rol: "admin" | "empleador" | "trabajador";
  ciudad?: string | null;
  region?: string | null;
  updated_at?: string | null;
  has_password: 0 | 1;
};

const initials = (n: string) =>
  n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "U";

// Sección de Datos Personales
export function DatosPersonalesSection() {
  const rm = useReducedMotion();
  const wrap = makeFadeUp(rm);
  const item = makeItem(rm);

  const [perfil, setPerfil] = useState<PerfilOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    rut: "",
    nombres: "",
    apellidos: "",
    correo: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErr(null);
    api
      .get<PerfilOut>("/perfil/mine", {
        signal: controller.signal,
        withCredentials: true,
      })
      .then(({ data }) => {
        setPerfil(data ?? null);
        if (data)
          setForm({
            rut: data.rut ?? "",
            nombres: data.nombres ?? "",
            apellidos: data.apellidos ?? "",
            correo: data.correo ?? "",
          });
      })
      .catch((e: any) => {
        if (e.name !== "CanceledError")
          setErr(String(e?.response?.data?.error ?? e?.message ?? "Error"));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const fullName = useMemo(
    () =>
      `${perfil?.nombres ?? ""} ${perfil?.apellidos ?? ""}`.trim() || "Usuario",
    [perfil]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.nombres.trim() || !form.apellidos.trim())
      return "Nombres y apellidos son obligatorios";
    if (!form.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      return "Correo inválido";
    if (!form.rut.trim()) return "RUT es obligatorio";
    return null;
  };

  const onSave = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const payload = {
        Rut: form.rut.trim(),
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim(),
      };
      const { data } = await api.patch<PerfilOut>(
        "/perfil/mine/datos",
        payload,
        { withCredentials: true }
      );
      setPerfil(data);
      setEdit(false);
    } catch (e: any) {
      setErr(
        String(e?.response?.data?.error ?? e?.message ?? "Error al guardar")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={wrap}
      initial="hidden"
      animate="show"
    >
      {/* Header card */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 ring-1 ring-indigo-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-600/10 text-indigo-700 flex items-center justify-center text-lg font-semibold">
            {initials(fullName)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-xs text-gray-500">
              Rol: <span className="font-medium">{perfil?.Rol ?? "–"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!edit ? (
              <button
                onClick={() => setEdit(true)}
                className="rounded-xl px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Editar
              </button>
            ) : (
              <>
                <button
                  disabled={saving}
                  onClick={onSave}
                  className="rounded-xl px-3 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button
                  disabled={saving}
                  onClick={() => {
                    setEdit(false);
                    if (perfil)
                      setForm({
                        rut: perfil.rut,
                        nombres: perfil.nombres,
                        apellidos: perfil.apellidos,
                        correo: perfil.correo,
                      });
                  }}
                  className="rounded-xl px-3 py-1.5 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
        <motion.h3
          className="text-lg font-semibold text-gray-900 mb-4"
          variants={item}
        >
          Datos personales
        </motion.h3>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="dp-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500"
            >
              Cargando…
            </motion.div>
          ) : err ? (
            <motion.div
              key="dp-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-600"
            >
              {err}
            </motion.div>
          ) : !perfil ? (
            <motion.div
              key="dp-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500"
            >
              No se pudo cargar el perfil.
            </motion.div>
          ) : (
            <motion.div
              key="dp-content"
              variants={makeList(rm)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* RUT */}
              <motion.div variants={item} className="space-y-1">
                <label className="text-xs text-gray-500">RUT</label>
                {edit ? (
                  <input
                    name="rut"
                    value={form.rut}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium">
                    {perfil.rut || "–"}
                  </div>
                )}
              </motion.div>
              {/* Nombres */}
              <motion.div variants={item} className="space-y-1">
                <label className="text-xs text-gray-500">Nombres</label>
                {edit ? (
                  <input
                    name="nombres"
                    value={form.nombres}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium">
                    {perfil.nombres || "–"}
                  </div>
                )}
              </motion.div>
              {/* Apellidos */}
              <motion.div variants={item} className="space-y-1">
                <label className="text-xs text-gray-500">Apellidos</label>
                {edit ? (
                  <input
                    name="apellidos"
                    value={form.apellidos}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium">
                    {perfil.apellidos || "–"}
                  </div>
                )}
              </motion.div>
              {/* Correo */}
              <motion.div variants={item} className="space-y-1">
                <label className="text-xs text-gray-500">Correo</label>
                {edit ? (
                  <input
                    name="correo"
                    value={form.correo}
                    onChange={onChange}
                    type="email"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium">
                    {perfil.correo || "–"}
                  </div>
                )}
              </motion.div>
              {/* Rol */}
              <motion.div variants={item} className="space-y-1">
                <label className="text-xs text-gray-500">Rol</label>
                <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium">
                  {perfil.Rol}
                </div>
              </motion.div>
              {/* Contraseña (solo visual) */}
              <motion.div variants={item} className="space-y-1">
                <label className="text-xs text-gray-500">Contraseña</label>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium select-none">
                    {perfil.has_password ? "••••••••" : "No establecida"}
                    <a
                      href="/auth/change-password"
                      className="text-xs px-2 py-1 rounded bg-indigo-600 text-white"
                    >
                      Cambiar
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}