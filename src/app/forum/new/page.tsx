import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import NewForumCard from "@/components/NewForumCard";

export default function NewForumPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-slate-900 py-16">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/70 to-slate-800"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8 text-white">
          <div className="flex flex-col gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                Nuevo foro
              </span>
              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                Crear una nueva conversación
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                Completa los campos necesarios para publicar un nuevo tema dentro de la comunidad de JobMatch y compartir tus dudas o aprendizajes.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/forum"
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a foros
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 w-full max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <NewForumCard />
      </section>
    </main>
  );
}