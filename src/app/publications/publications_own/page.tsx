"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PublicationCard from "@/components/PublicationCard";
import MyPostulationCard from "@/components/MyPostulationCard";
import PostulationFilterbar from "@/components/PublicationsOwnFilterbar";
import PublicationsOwnNavbar from "@/components/PublicationsOwnSidebar";
import CreatePublicationCard from "@/components/CreatePublicationCard";
import { useHelp } from "@/components/HelpWidget";

type View =
  | "mis-publicaciones"
  | "mis-postulaciones"
  | "crear-publicacion";

export default function Page() {
  const [currentView, setCurrentView] = useState<View>("mis-publicaciones");
  const searchParams = useSearchParams();
  const { register, unregister } = useHelp();

  useEffect(() => {
    unregister();

    if (currentView === "mis-publicaciones") {
      register([
        {
          title: "Mis publicaciones",
          content: (
            <div>
              <p>Aquí puedes ver todas las publicaciones que tú mismo creaste.</p>
              <p style={{ marginTop: 8 }}>
                Usa los filtros superiores para gestionar mejor tus publicaciones según su estado o ciudad.
              </p>
            </div>
          ),
        },
      ]);
    }

    if (currentView === "mis-postulaciones") {
      register([
        {
          title: "Mis postulaciones",
          content: (
            <div>
              <p>
                Aquí se muestran todas las publicaciones donde has enviado una postulación.
              </p>
              <p style={{ marginTop: 8 }}>
                Puedes ver si tu postulación está pendiente, aceptada o rechazada. Además de poder eliminar o ver la publicación a la que postulaste.
              </p>
            </div>
          ),
        },
      ]);
    }

    if (currentView === "crear-publicacion") {
      register([
        {
          title: "Crear publicación",
          content: (
            <div>
              <p>
                Aquí puedes crear una nueva necesidad o servicio para que otras personas puedan postular.
              </p>
              <p style={{ marginTop: 8 }}>
                Completa todos los campos requeridos y luego pulsa el botón para crear la publicación.
              </p>
            </div>
          ),
        },
      ]);
    }

    return () => unregister();
  }, [currentView, register, unregister]);

  const getSearchParamsObject = () => {
    const params: Record<string, string> = {};
    const q = searchParams.get("p_q");
    const tipo = searchParams.get("p_tipo");
    const estado = searchParams.get("p_estado");
    const fecha = searchParams.get("p_fecha");
    const etiquetas = searchParams.get("p_etiquetas");

    if (q) params.q = q;
    if (tipo) params.tipo = tipo;
    if (estado) params.estado = estado;
    if (fecha) params.fecha = fecha;
    if (etiquetas) params.etiquetas = etiquetas;

    return params;
  };

  const renderContent = () => {
    switch (currentView) {
      case "mis-publicaciones":
        return (
          <section className="space-y-6">
            <h1 className="text-3xl font-bold text-blue-600 text-center">
              Mis publicaciones
            </h1>

            {/* Filtro contextual para publicaciones */}
            <div className="relative z-50">
              <PostulationFilterbar mode="publicaciones" />
            </div>

            <div className="relative z-10 space-y-4">
              <PublicationCard
                searchParams={getSearchParamsObject()}
                scope="mine"
              />
            </div>
          </section>
        );

      case "mis-postulaciones":
        return (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-600 text-center">
              Mis postulaciones
            </h2>

            {/* Filtro contextual para postulaciones */}
            <div className="relative z-50">
              <PostulationFilterbar mode="postulaciones" />
            </div>

            <div className="relative z-10 space-y-4">
              <MyPostulationCard />
            </div>
          </section>
        );

      case "crear-publicacion":
        return (
          <section className="space-y-6">
            <CreatePublicationCard />
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sidebar fixed en desktop: bajar top para no cubrir el navbar superior (ajusta top-16 si tu header tiene otra altura) */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-16.5 h-[calc(100vh-4rem)] w-60">
          <PublicationsOwnNavbar
            className="h-full"
            onViewChange={setCurrentView}
            defaultView="mis-publicaciones"
          />
        </div>
      </div>

      {/* Contenido principal desplazado a la derecha en md+ y con padding-top para no quedar bajo el navbar */}
      <div className="md:ml-60 md:pt-16">
        <div className="py-12 px-4 sm:px-8 lg:px-12 mx-auto max-w-7xl">
          {/*
            Para móviles mostramos el navbar en flujo (arriba) y así no queda oculto:
            PublicationsOwnNavbar se vuelve visible sólo en pantallas pequeñas
          */}
          <div className="md:hidden mb-6">
            <PublicationsOwnNavbar
              onViewChange={setCurrentView}
              defaultView="mis-publicaciones"
            />
          </div>

          {renderContent()}
        </div>
      </div>
    </main>
  );
}
