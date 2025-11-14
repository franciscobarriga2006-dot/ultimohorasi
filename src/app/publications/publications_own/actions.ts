"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

function convertDecimalFields(obj: any): any {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(convertDecimalFields);
  if (typeof obj === "object") {
    const out: any = {};
    for (const k in obj) {
      const v = obj[k];
      if (
        v &&
        typeof v === "object" &&
        typeof (v as any).toNumber === "function"
      )
        out[k] = (v as any).toNumber();
      else if (v instanceof Date) out[k] = v.toISOString();
      else if (v && typeof v === "object") out[k] = convertDecimalFields(v);
      else out[k] = v;
    }
    return out;
  }
  return obj;
}

export type Filtro = "todo" | "buscar" | "ofrecer";

export async function GetPublications(filtro: Filtro = "todo") {
  const session = await getSession();
  const userId = Number(session?.sub);
  if (!Number.isInteger(userId)) return [];

  // ―― publicaciones creadas por el usuario
  const propias = async () =>
    prisma.publicacion.findMany({
      where: { usuarioId: userId },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        icono: true,
        tipo: true,
        estado: true,
        remuneracion: true,
        fechaPublicacion: true,
        fechaCierre: true,
        categoria: { select: { nombre: true, icono: true } },
        ubicacion: { select: { comuna: true, ciudad: true, region: true } },
        usuario: { select: { id: true, nombre: true, tipoUsuario: true } },
      },
      orderBy: { id: "desc" },
    });

  // ―― postulaciones hechas por el usuario → trae su publicacion asociada
  const ofrecidas = async () => {
    const rows = await prisma.postulacion.findMany({
      where: { usuarioId: userId },
      select: {
        publicacion: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            icono: true,
            tipo: true,
            estado: true,
            remuneracion: true,
            fechaPublicacion: true,
            fechaCierre: true,
            categoria: { select: { nombre: true, icono: true } },
            ubicacion: { select: { comuna: true, ciudad: true, region: true } },
            usuario: { select: { id: true, nombre: true, tipoUsuario: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });
    // mapea a la misma forma que propias
    return rows.map((r) => r.publicacion);
  };

  let data: any[] = [];
  if (filtro === "buscar") data = await propias();
  else if (filtro === "ofrecer") data = await ofrecidas();
  else {
    const [a, b] = await Promise.all([propias(), ofrecidas()]);
    const map = new Map<number, any>();
    [...a, ...b].forEach((p) => map.set(p.id, p));
    data = Array.from(map.values()).sort(
      (x, y) =>
        new Date(y.fechaPublicacion || 0).getTime() -
        new Date(x.fechaPublicacion || 0).getTime()
    );
  }

  return convertDecimalFields(data);
}

// ================== UPDATE ==================
const TipoTrabajo = z.enum(["FULLTIME", "PARTTIME", "FREELANCE"]);
const EstadoPublicacion = z.enum(["ACTIVO", "INACTIVO", "CERRADO"]);

const updateSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    titulo: z.string().min(1).optional(),
    descripcion: z.string().min(1).optional(),
    remuneracion: z.coerce.number().nonnegative().optional(),
    tipo: TipoTrabajo.optional(),
    categoriaId: z.coerce.number().int().positive().optional(),
    ubicacionId: z.coerce.number().int().positive().optional(),
    fechaCierre: z.preprocess(
      (v) =>
        v === null || v === "" ? null : v ? new Date(String(v)) : undefined,
      z.union([z.date(), z.null()]).optional()
    ),
    estado: EstadoPublicacion.optional(),
  })
  .refine((d) => Object.keys(d).some((k) => !["id"].includes(k)), {
    message: "Sin cambios",
  });

export type UpdateResult =
  | { ok: true; id: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function UpdatePublication(
  input: FormData | Record<string, any>
): Promise<UpdateResult> {
  const session = await getSession();
  if (!session?.sub) return { ok: false, error: "No autenticado" };
  const userId = Number(session.sub);
  if (!Number.isInteger(userId)) return { ok: false, error: "Sesión inválida" };

  const raw =
    input instanceof FormData
      ? Object.fromEntries(
          Array.from(input.entries()).map(([k, v]) => [k, String(v)])
        )
      : input;

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validación fallida",
      fieldErrors: parsed.error.flatten().fieldErrors as any,
    };
  }

  const existing = await prisma.publicacion.findUnique({
    where: { id: parsed.data.id },
    select: { usuarioId: true },
  });
  if (!existing) return { ok: false, error: "Publicación no encontrada" };
  if (existing.usuarioId !== userId)
    return { ok: false, error: "No autorizado" };

  const d: any = {};
  if (parsed.data.titulo !== undefined) d.titulo = parsed.data.titulo;
  if (parsed.data.descripcion !== undefined)
    d.descripcion = parsed.data.descripcion;
  if (parsed.data.remuneracion !== undefined)
    d.remuneracion = parsed.data.remuneracion;
  if (parsed.data.tipo !== undefined) d.tipo = parsed.data.tipo;
  if (parsed.data.estado !== undefined) d.estado = parsed.data.estado;
  if (parsed.data.categoriaId !== undefined)
    d.categoriaId = parsed.data.categoriaId;
  if (parsed.data.ubicacionId !== undefined)
    d.ubicacionId = parsed.data.ubicacionId;
  if (parsed.data.fechaCierre !== undefined)
    d.fechaCierre = parsed.data.fechaCierre;

  const upd = await prisma.publicacion.update({
    where: { id: parsed.data.id },
    data: d,
    select: { id: true },
  });

  return { ok: true, id: upd.id };
}

// ================== DELETE ==================
const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type DeleteResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function DeletePublication(
  input: FormData | { id: number } | number
): Promise<DeleteResult> {
  const session = await getSession();
  if (!session?.sub) return { ok: false, error: "No autenticado" };
  const userId = Number(session.sub);
  if (!Number.isInteger(userId)) return { ok: false, error: "Sesión inválida" };

  // Normaliza input
  const raw =
    input instanceof FormData
      ? { id: String(input.get("id") ?? "") }
      : typeof input === "number"
      ? { id: input }
      : input;

  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "ID inválido" };

  // Ownership
  const existing = await prisma.publicacion.findUnique({
    where: { id: parsed.data.id },
    select: { usuarioId: true },
  });
  if (!existing) return { ok: false, error: "Publicación no encontrada" };
  if (existing.usuarioId !== userId)
    return { ok: false, error: "No autorizado" };

  try {
    await prisma.publicacion.delete({ where: { id: parsed.data.id } });
    return { ok: true, id: parsed.data.id };
  } catch (err: any) {
    if (err?.code === "P2003") {
      // Violación de FK (tiene postulaciones/guardados/historial, etc.)
      return {
        ok: false,
        error: "No se puede eliminar: existen registros relacionados.",
      };
    }
    console.error("DeletePublication error:", err);
    return { ok: false, error: "Error al eliminar la publicación" };
  }
}
