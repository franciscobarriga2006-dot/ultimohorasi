"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Button from "@/components/button";
import api from "@/lib/api";

type NewForumForm = {
  titulo: string;
  consulta: string;
};

const initialForm: NewForumForm = {
  titulo: "",
  consulta: "",
};

export default function NewForumCard() {
  const [form, setForm] = useState<NewForumForm>(initialForm);
  const [touched, setTouched] = useState<Record<keyof NewForumForm, boolean>>({
    titulo: false,
    consulta: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof NewForumForm, string>> = {};

    if (!form.titulo.trim()) {
      next.titulo = "El título del foro es obligatorio.";
    } else if (form.titulo.length > 100) {
      next.titulo = "El título no puede superar los 100 caracteres.";
    }

    if (!form.consulta.trim()) {
      next.consulta = "La consulta del foro es obligatoria.";
    }

    return next;
  }, [form]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as keyof NewForumForm;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const field = event.target.name as keyof NewForumForm;
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setTouched({ titulo: true, consulta: true });
      setErrorMessage(null);
      setSuccessMessage(null);

      if (Object.keys(errors).length > 0) {
        setErrorMessage("Por favor corrige los campos marcados antes de continuar.");
        return;
      }

      if (!userId || !Number.isInteger(userId) || userId <= 0) {
        setErrorMessage(
          "No pudimos identificar tu sesión. Vuelve a iniciar sesión para crear un foro.",
        );
        return;
      }

      try {
        setIsSubmitting(true);
        const payload = {
          id_usuario: userId,
          titulo: form.titulo.trim(),
          consulta: form.consulta.trim(),
        };

        const { data } = await api.post(
          "/foros",
          payload,
          {
            headers: {
              "x-user-id": String(userId),
            },
          },
        );

        setSuccessMessage(`Foro creado correctamente con ID #${data?.id_foro ?? "desconocido"}.`);
        setForm(initialForm);
        setTouched({ titulo: false, consulta: false });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("my-forums:refresh"));
        }
      } catch (error) {
        console.error("Error al crear foro", error);
        const message =
          (error as any)?.response?.data?.error ||
          (error as Error)?.message ||
          "No fue posible crear el foro. Inténtalo nuevamente.";
        setErrorMessage(String(message));
      } finally {
        setIsSubmitting(false);
      }
    },
    [errors, form, userId],
  );

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

    const syncUserId = () => readUserId();

    readUserId();
    window.addEventListener("storage", syncUserId);
    window.addEventListener("focus", syncUserId);
    document.addEventListener("visibilitychange", syncUserId);

    return () => {
      window.removeEventListener("storage", syncUserId);
      window.removeEventListener("focus", syncUserId);
      document.removeEventListener("visibilitychange", syncUserId);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
            Datos del foro
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Completa la información del nuevo foro
          </h2>
          <p className="text-sm text-slate-600">
            Estos campos corresponden a la estructura de la base de datos y son necesarios para crear la conversación.
          </p>
        </div>
      </div>

      <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit}>
        {!userId ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Necesitas iniciar sesión para publicar un foro. Una vez autenticado, completaremos
            automáticamente tu identificador.
          </div>
        ) : null}

        {(errorMessage || successMessage) && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              errorMessage
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <div className="form-field flex flex-col gap-2">
          <label htmlFor="titulo" className="text-sm font-medium text-slate-700">
            Título del foro
          </label>
          <input
            id="titulo"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={100}
            placeholder="Describe brevemente el tema"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          {touched.titulo && errors.titulo ? (
            <p className="text-xs text-red-500">{errors.titulo}</p>
          ) : null}
          <p className="text-xs text-slate-400">
            Campo <strong>titulo</strong> de la tabla <strong>Foros</strong> (hasta 100 caracteres).
          </p>
        </div>

        <div className="form-field flex flex-col gap-2">
          <label htmlFor="consulta" className="text-sm font-medium text-slate-700">
            Consulta
          </label>
          <textarea
            id="consulta"
            name="consulta"
            value={form.consulta}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={6}
            placeholder="Explica en detalle la consulta para la comunidad"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          {touched.consulta && errors.consulta ? (
            <p className="text-xs text-red-500">{errors.consulta}</p>
          ) : null}
          <p className="text-xs text-slate-400">
            Contenido completo del foro almacenado en la columna <strong>consulta</strong>.
          </p>
        </div>

        <div className="form-buttons flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="reset"
            variant="outline"
            onClick={() => {
              setForm(initialForm);
              setTouched({ titulo: false, consulta: false });
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            Limpiar
          </Button>
          <Button type="submit" className="sm:w-auto" disabled={isSubmitting || !userId}>
            Registrar foro
          </Button>
        </div>
      </form>
    </div>
  );
}