import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import RegisterHelp from "@/components/RegisterHelp";

import DashboardForumCard from "@/components/DashboardForumCard";
import dashboardForumCardMocks from "@/components/DashboardForumCard.mocks";
import Forum from "@/components/Forum";

export default function ForumPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <RegisterHelp
        steps={[
          {
            title: "Foros de la comunidad",
            content: (
              <div>
                <p>
                  Esta es la sección de foros de JobMatch donde podrás
                  interactuar con otros usuarios de la plataforma.
                </p>
                <p style={{ marginTop: 12 }}>
                  En la parte superior encontrarás los foros destacados y debajo
                  todos los foros disponibles.
                </p>
              </div>
            ),
          },
          {
            title: "Interactuar con los foros",
            content: (
              <div>
                <p>Para participar en un foro:</p>
                <ul style={{ marginTop: 12, marginLeft: 20 }}>
                  <li>
                    Pulsa en cualquier tarjeta de foro para ver las
                    conversaciones
                  </li>
                  <li style={{ marginTop: 8 }}>
                    Lee las respuestas existentes o añade tu propia contribución
                  </li>
                  <li style={{ marginTop: 8 }}>
                    Puedes responder a otros usuarios o crear nuevos temas
                  </li>
                </ul>
              </div>
            ),
          },
        ]}
      />
      <section className="relative overflow-hidden bg-slate-900 py-16">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/70 to-slate-800"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8 text-white">
          <div className="flex flex-col gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                <MessageCircle className="h-4 w-4" />
                Comunidad JobMatch
              </span>
              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                Explora y comparte en nuestros foros
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                Conecta con otros trabajadores y empleadores para resolver
                dudas, compartir consejos y potenciar tus servicios. Estas
                tarjetas muestran cómo luce el resumen de cada conversación
                usando datos de ejemplo.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/forum/new"
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                <ArrowRight className="h-4 w-4" />
                Crear nuevo foro
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {dashboardForumCardMocks.map((foro, index) => (
              <DashboardForumCard
                key={foro.id_foro}
                forum={foro}
                actionLabel="Ir al foro"
                href={`#/foros/${foro.id_foro}`}
                showTutorial={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <Forum />
        </div>
      </section>
    </main>
  );
}
