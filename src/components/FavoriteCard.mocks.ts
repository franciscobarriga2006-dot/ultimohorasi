import { GuardadoFavorito } from "./FavoriteCard";

export const favoriteCardMocks: GuardadoFavorito[] = [
  {
    id_guardado: 101,
    id_usuario: 12,
    id_publicacion: 501,
    fecha: "2024-05-18T09:24:00Z",
    usuario: {
      id_usuario: 12,
      nombres: "Camila",
      apellidos: "Rojas",
      correo: "camila.rojas@example.com",
    },
    publicacion: {
      id_publicacion: 501,
      id_usuario: 88,
      titulo: "Técnico electricista para mantenciones de emergencia",
      descripcion:
        "Apoyo en reparaciones de emergencia en comercios y domicilios. Se requiere disponibilidad para turnos rotativos y licencia de conducir clase B.",
      direccion: "Av. Independencia 123",
      horario: "Turnos rotativos",
      tipo: "Presencial",
      monto: 650000,
      horas: "40 hrs/semana",
      estado: "activa",
      ciudad: "Santiago",
      region: "Metropolitana",
      fecha_publicacion: "2024-05-12T12:00:00Z",
      fecha_actualizacion: "2024-05-16T15:30:00Z",
      autor: {
        id_usuario: 88,
        nombres: "Ignacio",
        apellidos: "Fuentes",
      },
    },
  },
  {
    id_guardado: 102,
    id_usuario: 12,
    id_publicacion: 642,
    fecha: "2024-04-28T14:05:00Z",
    publicacion: {
      id_publicacion: 642,
      id_usuario: 90,
      titulo: "Diseñador UX/UI freelance",
      descripcion:
        "Proyecto de tres meses para rediseñar la experiencia de una plataforma educativa. Modalidad remota con reuniones semanales.",
      tipo: "Remoto",
      monto: 1200000,
      horas: "20 hrs/semana",
      estado: "pausada",
      ciudad: "Valparaíso",
      region: "Valparaíso",
      fecha_publicacion: "2024-04-10T10:15:00Z",
      fecha_actualizacion: "2024-04-25T19:45:00Z",
      autor: {
        id_usuario: 90,
        nombres: "Paula",
        apellidos: "Salinas",
      },
    },
  },
  {
    id_guardado: 103,
    id_usuario: 18,
    id_publicacion: 712,
    fecha: "2024-03-02T08:10:00Z",
    usuario: {
      id_usuario: 18,
      nombres: "Mauricio",
      apellidos: "Garrido",
    },
    publicacion: {
      id_publicacion: 712,
      id_usuario: 102,
      titulo: "Asistente de bodega part-time",
      descripcion:
        "Recepción, orden y despacho de productos. Turnos fin de semana y soporte en inventarios mensuales.",
      horario: "Fin de semana",
      tipo: "Presencial",
      monto: 280000,
      estado: "activa",
      ciudad: "Concepción",
      region: "Biobío",
      fecha_publicacion: "2024-02-20T09:00:00Z",
      fecha_actualizacion: "2024-02-22T09:30:00Z",
      autor: {
        id_usuario: 102,
        nombres: "Carolina",
        apellidos: "Mella",
      },
    },
  },
];

export type FavoriteCardMock = (typeof favoriteCardMocks)[number];