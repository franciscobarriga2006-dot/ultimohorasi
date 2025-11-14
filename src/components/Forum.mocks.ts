// components/Forum.mocks.ts
import dashboardForumCardMocks from "@/components/DashboardForumCard.mocks";

// Réplica mínima de la estructura (shape) que espera tu UI
export type ForoBase = {
  id_foro: number;
  id_usuario: number;
  titulo: string;
  consulta: string;
  fecha: string;
};

export type ForoAutor = {
  id_usuario: number;
  nombres?: string | null;
  apellidos?: string | null;
  rol?: "admin" | "empleador" | "trabajador" | null;
};

export type RespuestaForo = {
  id_respuesta: number;
  id_foro: number;
  id_usuario: number;
  respuesta: string;
  fecha: string;
  autor?: ForoAutor;
};

export type ForumDetail = ForoBase & {
  autor?: ForoAutor;
  total_respuestas?: number;
  respuestas?: RespuestaForo[];
};

// Mock de respuestas para cada foro
const mockRespuestas: Record<number, RespuestaForo[]> = {
  1: [
    {
      id_respuesta: 1,
      id_foro: 1,
      id_usuario: 3,
      respuesta:
        "¡Excelente pregunta! Te recomiendo actualizar tu perfil con certificaciones recientes y agregar un portafolio de trabajos anteriores. Eso siempre genera más confianza en los empleadores.",
      fecha: "2025-01-15T14:30:00.000Z",
      autor: {
        id_usuario: 3,
        nombres: "Carlos",
        apellidos: "Mendoza",
        rol: "trabajador",
      },
    },
    {
      id_respuesta: 2,
      id_foro: 1,
      id_usuario: 4,
      respuesta:
        "Además de lo que comentó Carlos, asegúrate de tener buenas referencias. Los empleadores valoran mucho las recomendaciones de trabajos previos.",
      fecha: "2025-01-15T16:45:00.000Z",
      autor: {
        id_usuario: 4,
        nombres: "María",
        apellidos: "González",
        rol: "empleador",
      },
    },
    {
      id_respuesta: 3,
      id_foro: 1,
      id_usuario: 5,
      respuesta:
        "Una foto profesional también ayuda bastante. Los perfiles con foto tienen un 60% más de visualizaciones según mi experiencia.",
      fecha: "2025-01-16T09:20:00.000Z",
      autor: {
        id_usuario: 5,
        nombres: "Pedro",
        apellidos: "Ramírez",
        rol: "trabajador",
      },
    },
  ],
  2: [
    {
      id_respuesta: 4,
      id_foro: 2,
      id_usuario: 6,
      respuesta:
        "Para evaluar candidatos, te sugiero revisar sus calificaciones previas y leer los comentarios de otros empleadores. También es bueno hacer una entrevista breve antes de contratar.",
      fecha: "2025-01-20T11:15:00.000Z",
      autor: {
        id_usuario: 6,
        nombres: "Laura",
        apellidos: "Fernández",
        rol: "empleador",
      },
    },
    {
      id_respuesta: 5,
      id_foro: 2,
      id_usuario: 7,
      respuesta:
        "Yo siempre pido referencias verificables. Es la mejor manera de asegurar que el trabajador es confiable y profesional.",
      fecha: "2025-01-20T13:30:00.000Z",
      autor: {
        id_usuario: 7,
        nombres: "Roberto",
        apellidos: "Silva",
        rol: "empleador",
      },
    },
  ],
  3: [
    {
      id_respuesta: 6,
      id_foro: 3,
      id_usuario: 8,
      respuesta:
        "Para destacar como electricista, asegúrate de mencionar tus certificaciones SEC y años de experiencia. También ayuda subir fotos de trabajos terminados.",
      fecha: "2025-01-22T10:00:00.000Z",
      autor: {
        id_usuario: 8,
        nombres: "Andrés",
        apellidos: "Torres",
        rol: "trabajador",
      },
    },
  ],
  4: [], // Sin respuestas aún
  5: [
    {
      id_respuesta: 7,
      id_foro: 5,
      id_usuario: 9,
      respuesta:
        "En cuanto a precios, lo ideal es investigar el mercado local. Para construcción en Santiago, un maestro cobra entre $25.000 y $35.000 por día aproximadamente.",
      fecha: "2025-01-25T15:20:00.000Z",
      autor: {
        id_usuario: 9,
        nombres: "Felipe",
        apellidos: "Morales",
        rol: "trabajador",
      },
    },
    {
      id_respuesta: 8,
      id_foro: 5,
      id_usuario: 10,
      respuesta:
        "También considera el tipo de trabajo. Trabajos especializados como soldadura o instalaciones eléctricas pueden cobrar más por hora.",
      fecha: "2025-01-25T17:45:00.000Z",
      autor: {
        id_usuario: 10,
        nombres: "Daniela",
        apellidos: "Ruiz",
        rol: "empleador",
      },
    },
  ],
  6: [
    {
      id_respuesta: 9,
      id_foro: 6,
      id_usuario: 11,
      respuesta:
        "Gestionar múltiples proyectos requiere organización. Te recomiendo usar un calendario digital y establecer prioridades claras desde el inicio.",
      fecha: "2025-01-28T09:30:00.000Z",
      autor: {
        id_usuario: 11,
        nombres: "Sofía",
        apellidos: "Castro",
        rol: "empleador",
      },
    },
  ],
  // IDs usados por listas de comunidad (Latest/Most/All)
  201: [
    {
      id_respuesta: 20101,
      id_foro: 201,
      id_usuario: 301,
      respuesta:
        "Te recomiendo partir con clientes cercanos y pedir referidos. Un volante digital sencillo ayuda mucho.",
      fecha: "2025-01-29T16:10:00.000Z",
      autor: {
        id_usuario: 301,
        nombres: "Nicolás",
        apellidos: "Vega",
        rol: "trabajador",
      },
    },
    {
      id_respuesta: 20102,
      id_foro: 201,
      id_usuario: 302,
      respuesta:
        "Registra tus trabajos con fotos antes/después. Eso sube la confianza y cierra más rápido.",
      fecha: "2025-01-30T10:00:00.000Z",
      autor: {
        id_usuario: 302,
        nombres: "Paula",
        apellidos: "Muñoz",
        rol: "empleador",
      },
    },
  ],
  202: [
    {
      id_respuesta: 20201,
      id_foro: 202,
      id_usuario: 303,
      respuesta:
        "Define precio por hora base y ajusta por complejidad del tema y desplazamiento.",
      fecha: "2025-01-29T18:30:00.000Z",
      autor: {
        id_usuario: 303,
        nombres: "Diego",
        apellidos: "Fuentes",
        rol: "trabajador",
      },
    },
  ],
  203: [
    {
      id_respuesta: 20301,
      id_foro: 203,
      id_usuario: 304,
      respuesta: "Bloques de tiempo y no sobreagendar. Usa recordatorios.",
      fecha: "2025-01-30T08:45:00.000Z",
      autor: {
        id_usuario: 304,
        nombres: "Valentina",
        apellidos: "Rojas",
        rol: "trabajador",
      },
    },
  ],
  204: [],
  205: [
    {
      id_respuesta: 20501,
      id_foro: 205,
      id_usuario: 305,
      respuesta: "Siempre contrato con señal y definición clara de alcance.",
      fecha: "2025-01-25T12:20:00.000Z",
      autor: {
        id_usuario: 305,
        nombres: "Claudia",
        apellidos: "Zúñiga",
        rol: "empleador",
      },
    },
  ],
  206: [
    {
      id_respuesta: 20601,
      id_foro: 206,
      id_usuario: 306,
      respuesta: "Precios de referencia por tarea y matizar según la urgencia.",
      fecha: "2025-01-27T09:15:00.000Z",
      autor: {
        id_usuario: 306,
        nombres: "Tomás",
        apellidos: "Soto",
        rol: "trabajador",
      },
    },
  ],
};

const map = (x: any, includeRespuestas: boolean = false): ForumDetail => {
  const baseData: ForumDetail = {
    id_foro: x.id_foro,
    id_usuario: x.id_usuario,
    titulo: x.titulo,
    consulta: x.consulta,
    fecha: x.fecha,
    autor: x.usuario
      ? {
          id_usuario: x.usuario.id_usuario,
          nombres: x.usuario.nombres ?? null,
          apellidos: x.usuario.apellidos ?? null,
          rol: null,
        }
      : undefined,
    total_respuestas:
      typeof x.respuestas?.total === "number" ? x.respuestas.total : undefined,
  };

  // Si se solicita incluir respuestas, las agregamos
  if (includeRespuestas) {
    baseData.respuestas = mockRespuestas[x.id_foro] || [];
    // Actualizar el total de respuestas con los datos mock si no está definido
    if (baseData.total_respuestas === undefined) {
      baseData.total_respuestas = baseData.respuestas.length;
    }
  }

  return baseData;
};

export async function mockFetchForums(params?: {
  q?: string;
}): Promise<ForumDetail[]> {
  const q = (params?.q ?? "").toLowerCase().trim();
  const arr = dashboardForumCardMocks.map((x) => map(x, false)); // No incluir respuestas en el listado
  return q
    ? arr.filter(
        (f) =>
          f.titulo.toLowerCase().includes(q) ||
          f.consulta.toLowerCase().includes(q)
      )
    : arr;
}

export async function mockFetchForumById(
  id_foro: number
): Promise<ForumDetail> {
  const raw = dashboardForumCardMocks.find(
    (m) => m.id_foro === Number(id_foro)
  );
  if (!raw) throw new Error("Foro no encontrado");
  return map(raw, true); // Incluir respuestas en el detalle
}

// Permite obtener solo las respuestas de un foro (para listas de comunidad)
export async function mockFetchRespuestasByForo(
  id_foro: number
): Promise<RespuestaForo[]> {
  return mockRespuestas[id_foro] ? [...mockRespuestas[id_foro]] : [];
}
