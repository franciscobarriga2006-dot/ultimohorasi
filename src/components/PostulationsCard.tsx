"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

type Postulacion = {
  id_postulacion: number;
  id_publicacion?: number;
  id_postulante?: number;
  nombre_postulante?: string;
  mensaje?: string | null;
  fecha?: string;
  estado_postulacion?: string;
  [k: string]: any;
};

type Props = {
  publicacionId: number | string;
  className?: string;
  onSelect?: (p: Postulacion) => void;
};

export default function PostulationsCard({ publicacionId, className = "", onSelect }: Props) {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // map id_postulante -> nombre
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!publicacionId) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      const urls = [
        `/api/postulaciones?publicacionId=${encodeURIComponent(String(publicacionId))}`,
        `/postulaciones?publicacionId=${encodeURIComponent(String(publicacionId))}`,
      ];

      // Si quieres forzar un actor en dev: exportar NEXT_PUBLIC_DEV_USER_ID=1 en .env.local
      const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
      const headers: Record<string,string> = {};
      if (devUserId) headers['x-user-id'] = String(devUserId);

      try {
        let resp: any = null;
        for (const u of urls) {
          try {
            console.debug('[PostulationsCard] intentando URL:', u, 'headers:', headers);
            resp = await api.get(u, { withCredentials: true, headers });
            console.debug('[PostulationsCard] respuesta:', u, resp && { status: resp.status, data: resp.data });
            if (resp && resp.data) break;
          } catch (e: any) {
            console.warn('[PostulationsCard] fallo URL:', u, e?.response?.status, e?.message);
            resp = null;
          }
        }

        if (cancelled) return;

        if (!resp || !resp.data) {
          throw new Error("Respuesta vacía del servidor");
        }

        const data =
          Array.isArray(resp.data) ? resp.data :
          Array.isArray(resp.data?.items) ? resp.data.items :
          Array.isArray(resp.data?.rows) ? resp.data.rows :
          [];

        setItems(data);
      } catch (err: any) {
        if (cancelled) return;
        setError(String(err?.response?.data?.error ?? err?.message ?? "Error al cargar postulaciones"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [publicacionId]);

  // cuando items cambian, obtener nombres faltantes de postulantes
  useEffect(() => {
    const idsToFetch = Array.from(
      new Set(
        items
          .filter((p) => !p.nombre_postulante && p.id_postulante)
          .map((p) => String(p.id_postulante))
          .filter((id) => !usersMap[id])
      )
    );

    if (!idsToFetch.length) return;
    let cancelled = false;

    const fetchUserName = async (id: string) => {
      // intenta rutas conocidas; ajusta según tu server
      const urls = [
        `/api/usuarios/${id}`,
        `/usuarios/${id}`,
        `/api/users/${id}`,
        `/users/${id}`,
      ];
      for (const u of urls) {
        try {
          const resp: any = await api.get(u, { withCredentials: true });
          if (!resp || !resp.data) continue;
          // posibles formas de respuesta: { user: {...} } | usuario object | { items: [...] }
          const payload = resp.data?.user ?? resp.data;
          if (!payload) continue;

          const nombres = payload.nombres ?? payload.nombre ?? payload.firstName ?? null;
          const apellidos = payload.apellidos ?? payload.lastName ?? null;

          const name =
            nombres && apellidos
              ? `${String(nombres).trim()} ${String(apellidos).trim()}`
              : nombres
              ? String(nombres).trim()
              : payload.nombre
              ? String(payload.nombre).trim()
              : payload.fullName
              ? String(payload.fullName).trim()
              : null;

          if (name) return name;
        } catch (e) {
          // continúa intentando otras urls
        }
      }
      return null;
    };

    const fetchNames = async () => {
      try {
        await Promise.all(
          idsToFetch.map(async (id) => {
            if (cancelled) return;
            const name = await fetchUserName(id);
            if (!cancelled && name) {
              setUsersMap((prev) => ({ ...prev, [id]: name }));
            }
          })
        );
      } catch {
        // ignore
      }
    };

    fetchNames();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`} aria-live="polite">
        <div className="text-sm text-gray-600">Cargando postulaciones…</div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-20 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-sm text-gray-600">No hay postulaciones para esta publicación.</div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((p) => {
        const idPost = p.id_postulante ?? "";
        // usar cualquier campo disponible devuelto por el backend antes del fallback
        const backendFullName =
          (p.nombre_postulante && String(p.nombre_postulante).trim()) ||
          ((p.usuario_nombres || p.usuario_apellidos) &&
            `${String(p.usuario_nombres || "").trim()} ${String(p.usuario_apellidos || "").trim()}`.trim()) ||
          (p.usuario_nombre && String(p.usuario_nombre).trim());

        const displayName =
          backendFullName ||
          usersMap[String(idPost)] ||
          (idPost ? `Postulante #${idPost}` : `Postulación #${p.id_postulacion}`);

        return (
          <article
            key={p.id_postulacion ?? `${p.id_postulante}-${p.fecha}`}
            className="rounded-xl border bg-white p-3 shadow-sm flex items-start gap-3"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-gray-800">
                  {displayName}
                </div>
                <div className="text-xs text-gray-400">
                  {p.fecha ? new Date(p.fecha).toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : ""}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                {p.mensaje ?? <span className="text-gray-400">Sin mensaje</span>}
              </div>

              {p.estado_postulacion && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                    {p.estado_postulacion}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 ml-2">
              <button
                type="button"
                className="text-xs px-2 py-1 rounded-md bg-sky-600 text-white"
                onClick={() => onSelect?.(p)}
              >
                Ver
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}