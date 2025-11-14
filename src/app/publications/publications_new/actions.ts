// app/publications/publications_new/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

export const getMeta = async () => {
  const [categorias, ubicaciones] = await Promise.all([
    prisma.categoria.findMany({ select: { id: true, nombre: true } }),
    prisma.ubicacion.findMany({
      select: { id: true, ciudad: true, comuna: true, region: true },
      orderBy: [{ region: "asc" }, { ciudad: "asc" }, { comuna: "asc" }],
    }),
  ]);
  return { categorias, ubicaciones };
};

const TipoTrabajo = z.enum(["FULLTIME", "PARTTIME", "FREELANCE"]);

const createSchema = z.object({
  titulo: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  remuneracion: z.coerce.number().nonnegative("Debe ser un número válido"),
  tipo: TipoTrabajo,
  categoriaId: z.coerce.number().int().positive(),
  ubicacionId: z.coerce.number().int().positive(),
  fechaCierre: z
    .preprocess((v) => (v ? new Date(String(v)) : undefined), z.date().optional()),
});

export type CreateResult =
  | { ok: true; id: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPublicationAction(input: FormData | Record<string, any>): Promise<CreateResult> {
  const session = await getSession();
  if (!session?.sub) return { ok: false, error: "No autenticado" };
  const usuarioId = Number(session.sub);

  const raw =
    input instanceof FormData
      ? Object.fromEntries(Array.from(input.entries()).map(([k, v]) => [k, String(v)]))
      : input;

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Validación fallida", fieldErrors: parsed.error.flatten().fieldErrors as any };
  }

  const created = await prisma.publicacion.create({
    data: {
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      remuneracion: parsed.data.remuneracion, // Prisma acepta number/string para Decimal
      tipo: parsed.data.tipo,
      estado: "ACTIVO",
      fechaCierre: parsed.data.fechaCierre,
      usuarioId,
      categoriaId: parsed.data.categoriaId,
      ubicacionId: parsed.data.ubicacionId,
    },
    select: { id: true },
  });

  return { ok: true, id: created.id };
}
