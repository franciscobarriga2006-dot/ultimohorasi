"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "@/components/animations";
import { X, MessageSquarePlus, ChevronRight, ChevronLeft } from "lucide-react";

type NullableDate = string | number | Date | null | undefined;

type UsuarioLigero = {
  id_usuario?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
  correo?: string | null;
};

type ResumenRespuesta = {
  total?: number | null;
  ultimaRespuesta?: NullableDate;
  ultimoUsuario?: UsuarioLigero | null;
};

export type DashboardForum = {
  id_foro: number;
  id_usuario: number;
  titulo: string;
  consulta: string;
  fecha: NullableDate;
  usuario?: UsuarioLigero | null;
  respuestas?: ResumenRespuesta | null;
};

type DashboardForumCardProps = {
  forum: DashboardForum;
  href?: string;
  onSelect?: (forumId: number) => void;
  actionLabel?: string;
  showTutorial?: boolean;
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

const getUsuarioNombre = (
  usuario: UsuarioLigero | null | undefined,
  fallbackId?: number
) => {
  if (!usuario) return fallbackId ? `Usuario #${fallbackId}` : "—";

  const partes = [usuario.nombres, usuario.apellidos].filter(Boolean);

  if (partes.length) return partes.join(" ");
  if (usuario.correo) return usuario.correo;
  if (usuario.id_usuario) return `Usuario #${usuario.id_usuario}`;
  if (fallbackId) return `Usuario #${fallbackId}`;
  return "—";
};

// Tutorial Modal Component
function TutorialModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: "¿Tienes dudas sobre algo?",
      description:
        "¡Crea un foro! Es muy sencillo y la comunidad está lista para ayudarte.",
      content: (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500">
              <MessageSquarePlus className="h-12 w-12 text-white" />
            </div>
            <p className="mt-6 text-lg font-medium text-slate-700">
              Comparte tus preguntas con la comunidad JobMatch
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Paso 1: Explora los foros",
      description:
        "Dirígete a la sección de foros para ver las conversaciones existentes.",
      content: (
        <div className="space-y-4 p-6">
          <div className="rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              Navega a:{" "}
              <span className="font-bold text-sky-600">Explorar Foros</span>
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse delay-75" />
              <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse delay-150" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Paso 2: Crea tu publicación",
      description: "Busca y presiona el botón de crear publicación.",
      content: (
        <div className="space-y-4 p-6">
          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <MessageSquarePlus className="h-5 w-5" />
              Crear Publicación
            </button>
          </div>
          <p className="text-center text-sm text-slate-600">
            Este botón te permitirá iniciar una nueva conversación
          </p>
        </div>
      ),
    },
    {
      title: "Paso 3: Completa tu foro",
      description: "Llena los campos con la información de tu consulta.",
      content: (
        <div className="space-y-4 p-6">
          <article className="rounded-2xl bg-gradient-to-tr from-sky-500/25 via-indigo-500/25 to-purple-500/25 p-[1px]">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Título del foro *
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¿Cómo mejorar mi perfil profesional?"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  disabled
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tu consulta *
                </label>
                <textarea
                  placeholder="Describe tu duda o tema a tratar..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  disabled
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
                  disabled
                >
                  Publicar Foro
                </button>
              </div>
            </div>
          </article>
          <p className="text-center text-xs text-slate-500">
            * Campos requeridos para crear tu foro
          </p>
        </div>
      ),
    },
    {
      title: "¡Listo!",
      description:
        "Tu foro será publicado y la comunidad podrá ayudarte con tus dudas.",
      content: (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mt-6 text-lg font-medium text-slate-700">
              ¡Comienza a compartir con la comunidad!
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Otros usuarios podrán ver tu foro y responder tus preguntas
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;
  const isFirstStep = step === 0;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            initial={{ y: 20, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {currentStep.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {currentStep.description}
              </p>
            </div>

            <div className="min-h-[300px]">{currentStep.content}</div>

            <div className="flex items-center justify-between border-t border-slate-200 px-8 py-6">
              <div className="flex gap-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === step ? "w-8 bg-sky-600" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {!isFirstStep && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                )}

                {!isLastStep ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    ¡Entendido!
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DashboardForumCard({
  forum,
  href,
  onSelect,
  actionLabel = "Ver detalles",
  showTutorial = false,
}: DashboardForumCardProps) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const respuestasTotales = forum.respuestas?.total ?? null;
  const hasRespuestas =
    typeof respuestasTotales === "number" && respuestasTotales > 0;

  const ultimaRespuestaTexto = useMemo(() => {
    if (!forum.respuestas?.ultimaRespuesta) return "—";
    return formatDateTime(forum.respuestas.ultimaRespuesta);
  }, [forum.respuestas?.ultimaRespuesta]);

  const ultimoUsuarioNombre = useMemo(() => {
    return getUsuarioNombre(forum.respuestas?.ultimoUsuario, forum.id_usuario);
  }, [forum.respuestas?.ultimoUsuario, forum.id_usuario]);

  const actionElement = href ? (
    <motion.a
      className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {actionLabel}
    </motion.a>
  ) : onSelect ? (
    <motion.button
      className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      type="button"
      onClick={() => onSelect(forum.id_foro)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {actionLabel}
    </motion.button>
  ) : null;

  return (
    <>
      <motion.article
        className="group relative h-full rounded-2xl bg-gradient-to-tr from-sky-500/25 via-indigo-500/25 to-purple-500/25 p-[1px]"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          {showTutorial && (
            <div className="mb-2 rounded-lg bg-gradient-to-r from-sky-50 to-indigo-50 p-3 ring-1 ring-sky-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <MessageSquarePlus className="h-5 w-5 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700">
                    ¿Primera vez creando un foro?
                  </p>
                  <button
                    onClick={() => setIsTutorialOpen(true)}
                    className="mt-1 text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
                  >
                    Ver tutorial paso a paso →
                  </button>
                </div>
              </div>
            </div>
          )}

          <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  #{forum.id_foro}
                </span>
                Foro
              </span>
              <h3 className="mt-1 text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                {forum.titulo}
              </h3>
            </div>

            {typeof respuestasTotales === "number" && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-600">
                  {Math.max(0, respuestasTotales)}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Respuestas
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {respuestasTotales === 1
                      ? "1 respuesta"
                      : `${Math.max(0, respuestasTotales)} respuestas`}
                  </span>
                </div>
              </div>
            )}
          </header>

          <p className="text-sm text-slate-700 line-clamp-4">
            {forum.consulta}
          </p>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Creado por
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {getUsuarioNombre(forum.usuario, forum.id_usuario)}
              </dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Fecha de creación
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatDateTime(forum.fecha)}
              </dd>
            </div>

            {hasRespuestas && (
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Última respuesta
                </dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {ultimaRespuestaTexto}
                </dd>
              </div>
            )}

            {hasRespuestas && (
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Respondió por última vez
                </dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {ultimoUsuarioNombre}
                </dd>
              </div>
            )}
          </dl>

          {(typeof forum.id_usuario === "number" || actionElement) && (
            <footer className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500">
                ID usuario: #{forum.id_usuario}
              </span>
              {actionElement}
            </footer>
          )}
        </div>
      </motion.article>

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </>
  );
}
