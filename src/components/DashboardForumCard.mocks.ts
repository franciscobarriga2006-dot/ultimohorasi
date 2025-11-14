import type { DashboardForum } from "./DashboardForumCard";

/**
 * Datos de ejemplo reutilizables para previsualizar `DashboardForumCard`.
 * Puedes importar este arreglo en páginas, pruebas o historias mientras
 * conectas el componente con tu API real.
 */
export const dashboardForumCardMocks: DashboardForum[] = [
  {
    id_foro: 12,
    id_usuario: 71,
    titulo: "Consejos para iniciar como electricista independiente",
    consulta:
      "Estoy comenzando a ofrecer servicios eléctricos a domicilio y me gustaría saber qué herramientas y certificaciones recomiendan.",
    fecha: "2024-08-19T14:12:00.000Z",
    usuario: {
      id_usuario: 71,
      nombres: "Carolina",
      apellidos: "Mora",
    },
    respuestas: {
      total: 5,
      ultimaRespuesta: "2024-08-21T09:32:00.000Z",
      ultimoUsuario: {
        id_usuario: 44,
        nombres: "Luis",
        apellidos: "Araya",
      },
    },
  },
  {
    id_foro: 18,
    id_usuario: 96,
    titulo: "¿Cómo cotizar trabajos de jardinería por hora?",
    consulta:
      "Tengo experiencia en jardinería pero no sé cómo estructurar mis precios al visitar diferentes comunas. ¿Algunas recomendaciones?",
    fecha: "2024-08-11T10:27:00.000Z",
    usuario: {
      id_usuario: 96,
      nombres: "Rodrigo",
      apellidos: "Campos",
    },
    respuestas: {
      total: 2,
      ultimaRespuesta: "2024-08-12T18:05:00.000Z",
      ultimoUsuario: {
        id_usuario: 15,
        nombres: "Fabiola",
        apellidos: "Reyes",
      },
    },
  },
  {
    id_foro: 27,
    id_usuario: 82,
    titulo: "Requisitos para certificarme como maestro gásfiter",
    consulta:
      "Quiero postular a trabajos industriales y me piden certificación SEC. ¿Alguien sabe cuánto dura el proceso y qué materias cubren los exámenes?",
    fecha: "2024-07-30T16:48:00.000Z",
    usuario: {
      id_usuario: 82,
      nombres: "Marcela",
      apellidos: "Oyarzún",
    },
    respuestas: {
      total: 0,
      ultimaRespuesta: null,
      ultimoUsuario: null,
    },
  },
];

export default dashboardForumCardMocks;