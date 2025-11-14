"use client";

import { useState, useEffect } from "react";
import { useHelp } from "@/components/HelpWidget";
import DashboardProfileCard from "@/components/DashboardProfileCard";
import ProfileSidebar from "@/components/ProfileSidebar";
import {
  PublicacionesSection,
  PostulacionesSection,
  PendientesSection,
  FavoritosSection,
  HistorialSection,
  BloqueadosSection,
  DatosPersonalesSection,
} from "@/components/ProfileSections";

export default function Demo() {
  const [activeSection, setActiveSection] = useState("personal");
  const { register, unregister } = useHelp(); // ✅ Se añade esto

  const perfilEjemplo = {
    ciudad: "Temuco",
    region: "Araucanía",
    insignia: 4.7,
    experiencia:
      "Especialista en limpieza residencial con más de 4 años de experiencia.\nTrabajo detallista y eficiente.",
    habilidades: "Limpieza profunda, Fontanería básica, Desinfección de espacios",
    disponibilidad_horaria: "Lunes a Viernes 9:00 - 18:00",
    updated_at: "2025-10-14T13:20:00.000Z",
  };


  useEffect(() => {
    unregister();

    switch (activeSection) {
      case "personal":
        register([
          {
            title: "Información visible en tu perfil",
            content: (
              <div>
                <p>Aquí puedes ver lo que otros usuarios ven de tu perfil público.</p>
                <p style={{ marginTop: 8 }}>
                  Incluye tu descripción, habilidades, disponibilidad y calificaciones.
                </p>
              </div>
            ),
          },
          {
            title: "Mejora tus oportunidades",
            content: (
              <div>
                <p>Completar tu perfil aumenta tus posibilidades de ser contactado.</p>
                <p style={{ marginTop: 8 }}>Mantén tu experiencia y datos actualizados</p>
              </div>
            ),
          },
        ]);
        break;

      case "datos":
        register([
          {
            title: "Edita tus datos personales",
            content: (
              <div>
                <p>Aquí puedes cambiar tu información privada como nombre, correo, contraseña, contacto y ciudad.</p>
                <p>Estos datos no siempre son visibles para todos los usuarios.</p>
              </div>
            ),
          },
        ]);
        break;

      case "publicaciones":
        register([
          {
            title: "Tus publicaciones creadas",
            content: (
              <div>
                <p>Revisa y gestiona todas las publicaciones que has creado.</p>
                <p style={{ marginTop: 8 }}>
                  Puedes editar o cerrar una publicación cuando quieras.
                </p>
              </div>
            ),
          },
        ]);
        break;

      case "pendientes":
        register([
          {
            title: "Postulaciones recibidas",
            content: (
              <div>
                <p>Aquí verás todas tus postulaciones pendientes.</p>
                <p style={{ marginTop: 8 }}>
                  Puedes ir directamente a la publicación para ver los detalles.
                </p>
              </div>
            ),
          },
        ]);
        break;

      case "favoritos":
        register([
          {
            title: "Tus publicaciones favoritas",
            content: (
              <div>
                <p>Guarda publicaciones que te interese revisar más tarde.</p>
                <p style={{ marginTop: 8 }}>Puedes postular directamente desde aquí.</p>
              </div>
            ),
          },
        ]);
        break;

      case "historial":
        register([
          {
            title: "Historial de actividades",
            content: (
              <div>
                <p>Aquí puedes ver tus trabajos completados y transacciones pasadas.</p>
                <p style={{ marginTop: 8 }}>
                  Es un registro que muestra tu experiencia dentro de la plataforma.
                </p>
              </div>
            ),
          },
        ]);
        break;

      case "bloqueados":
        register([
          {
            title: "Usuarios bloqueados",
            content: (
              <div>
                <p>Gestión de usuarios con los que no quieres interactuar.</p>
                <p style={{ marginTop: 8 }}>
                  Si necesitas, aquí puedes desbloquear a alguien más tarde.
                </p>
              </div>
            ),
          },
        ]);
        break;
    }

    return () => unregister();
  }, [activeSection, register, unregister]);

  // Render de sección (sin cambios)
  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <DashboardProfileCard perfil={perfilEjemplo} />;
      case "datos":
        return <DatosPersonalesSection />;
      case "publicaciones":
        return <PublicacionesSection />;
      case "postulaciones": // NUEVO
        return <PostulacionesSection />;
      case "pendientes":
        return <PendientesSection />;
      case "favoritos":
        return <FavoritosSection />;
      case "historial":
        return <HistorialSection />;
      case "bloqueados":
        return <BloqueadosSection />;
      default:
        return <DashboardProfileCard perfil={perfilEjemplo} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <ProfileSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="transition-opacity duration-200">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
}
