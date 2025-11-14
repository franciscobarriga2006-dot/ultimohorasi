"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type NullableDate = string | number | Date | null | undefined;

type MyForum = {
  id_foro: number;
  id_usuario: number;
  titulo: string;
  consulta: string;
  fecha: NullableDate;
};

type ApiResponse = {
  items?: MyForum[];
  limit?: number;
  offset?: number;
};

type MyForumsProps = {
  userId: number | null;
  onRequestLogin?: () => void;
};

const formatDateTime = (value: NullableDate) => {
  if (value == null) return "—";
  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
      ? new Date(value)
      : typeof value === "string"
      ? new Date(value)
      : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeForums = (items?: MyForum[]) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is MyForum => Boolean(item && item.id_foro && item.titulo))
    .map((item) => ({
      ...item,
      titulo: item.titulo ?? "(Sin título)",
      consulta: item.consulta ?? "",
    }));
};

export default function MyForums({ userId, onRequestLogin }: MyForumsProps) {
  const [forums, setForums] = useState<MyForum[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // edición en línea
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editConsulta, setEditConsulta] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isAuthenticated = useMemo(() => Boolean(userId && userId > 0), [userId]);

  // ---- Carga de "Mis foros" (GET /mis-foros con header x-user-id) ----
  useEffect(() => {
    if (!isAuthenticated) {
      setForums([]);
      setStatus("idle");
      return;
    }

    let active = true;
    const load = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const { data } = await api.get<ApiResponse>("/mis-foros", {
          params: { limit: 50 },
          headers: { "x-user-id": String(userId) }, // <- importante: header
          withCredentials: true,
        });
        if (!active) return;
        setForums(normalizeForums(data?.items));
        setStatus("success");
      } catch (error: any) {
        if (!active) return;
        const responseStatus = error?.response?.status;
        if (responseStatus === 401) {
          setErrorMessage("Necesitas iniciar sesión para ver tus foros.");
        } else {
          const message =
            error?.response?.data?.error ||
            error?.message ||
            "Ocurrió un error al cargar tus foros.";
          setErrorMessage(String(message));
        }
        setStatus("error");
        setForums([]);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, refreshKey, userId]);

  // refresco externo opcional
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleExternalRefresh = () => {
      setRefreshKey((key) => key + 1);
    };

    window.addEventListener("my-forums:refresh", handleExternalRefresh);
    return () => {
      window.removeEventListener("my-forums:refresh", handleExternalRefresh);
    };
  }, [isAuthenticated]);

  const handleRefresh = () => {
    if (!isAuthenticated) {
      onRequestLogin?.();
      return;
    }
    setRefreshKey((key) => key + 1);
  };

  // ---- Edición: iniciar / cancelar ----
  const startEdit = (f: MyForum) => {
    setEditingId(f.id_foro);
    setEditTitulo(f.titulo ?? "");
    setEditConsulta(f.consulta ?? "");
    setErrorMessage(null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitulo("");
    setEditConsulta("");
  };

  // ---- PATCH /foros/:id (actualizar título/consulta) ----
  const saveEdit = async () => {
    if (!isAuthenticated || !editingId) return;

    const payload: Record<string, string> = {};
    const t = editTitulo.trim();
    const c = editConsulta.trim();
    if (t !== "") payload.titulo = t;
    if (c !== "") payload.consulta = c;

    if (Object.keys(payload).length === 0) {
      setErrorMessage("Nada para actualizar.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      const { data } = await api.patch(
        `/foros/${editingId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": String(userId),
          },
          withCredentials: true,
        }
      );

      // Actualización optimista
      setForums((prev) =>
        prev.map((f) =>
          f.id_foro === editingId
            ? {
                ...f,
                titulo: data?.titulo ?? payload.titulo ?? f.titulo,
                consulta: data?.consulta ?? payload.consulta ?? f.consulta,
                fecha: data?.fecha ?? f.fecha,
              }
            : f
        )
      );

      cancelEdit();
    } catch (error: any) {
      const r = error?.response;
      const msg =
        r?.data?.error ||
        (r?.status === 403
          ? "No autorizado para editar este foro."
          : r?.status === 404
          ? "Foro no encontrado."
          : error?.message || "No se pudo actualizar el foro.");
      setErrorMessage(String(msg));
    } finally {
      setSaving(false);
    }
  };

  // ---- DELETE /foros/:id (eliminar) ----
  const removeForum = async (id: number) => {
    if (!isAuthenticated) return;
    setErrorMessage(null);

    const confirmed = window.confirm("¿Eliminar este foro? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await api.delete(`/foros/${id}`, {
        headers: { "x-user-id": String(userId) },
        withCredentials: true,
      });

      if (res.status !== 204) {
        const msg = (res as any)?.data?.error || "No se pudo eliminar el foro.";
        throw new Error(msg);
      }

      setForums((prev) => prev.filter((f) => f.id_foro !== id));
      if (editingId === id) cancelEdit();
    } catch (error: any) {
      const r = error?.response;
      const msg =
        r?.data?.error ||
        (r?.status === 403
          ? "No autorizado para eliminar este foro."
          : r?.status === 404
          ? "Foro no encontrado."
          : error?.message || "No se pudo eliminar el foro.");
      setErrorMessage(String(msg));
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Mis foros</h3>
        <p className="mt-2 text-sm text-slate-600">
          Debes iniciar sesión para ver y administrar tus foros creados.
        </p>
        <button
          type="button"
          onClick={onRequestLogin}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mis foros</h2>
          <p className="text-sm text-slate-600">
            Aquí encontrarás los foros que has creado utilizando tu cuenta.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={status === "loading"}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              status === "loading" ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-700"
            }`}
          >
            {status === "loading" ? "Actualizando..." : "Actualizar lista"}
          </button>
        </div>
      </header>

      {status === "loading" && forums.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-10/12 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {status === "success" && forums.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-900">Aún no has creado foros</p>
          <p className="mt-2 text-sm text-slate-600">
            Publica tu primer foro desde el botón "Crear nuevo foro".
          </p>
        </div>
      )}

      {forums.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {forums.map((forum) => {
            const isEditing = editingId === forum.id_foro;
            return (
              <article
                key={forum.id_foro}
                className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <header className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                        #{forum.id_foro}
                      </span>
                      Foro creado
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {formatDateTime(forum.fecha)}
                    </span>
                  </div>

                  {!isEditing ? (
                    <h3 className="text-lg font-semibold text-slate-900">{forum.titulo}</h3>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-600">Título</label>
                      <input
                        value={editTitulo}
                        onChange={(e) => setEditTitulo(e.target.value)}
                        maxLength={100}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}
                </header>

                {!isEditing ? (
                  <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{forum.consulta}</p>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Consulta</label>
                    <textarea
                      value={editConsulta}
                      onChange={(e) => setEditConsulta(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <footer className="mt-6 flex items-center justify-between text-xs text-slate-500">
                  <span>ID foro: {forum.id_foro}</span>
                  <span>ID usuario: {forum.id_usuario}</span>
                </footer>

                {/* Acciones */}
                {!isEditing ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(forum)}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeForum(forum.id_foro)}
                      disabled={deletingId === forum.id_foro}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === forum.id_foro ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? "Guardando…" : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
