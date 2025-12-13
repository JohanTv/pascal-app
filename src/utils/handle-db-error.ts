import type { Failure } from "@/types/result.types";

export function handleDbError(e: unknown): Failure {
  console.error("DB Error:", e); // Log para el desarrollador

  // Errores conocidos de Prisma
  // if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //   if (e.code === 'P2002') return { success: false, error: "El registro ya existe." };
  //   if (e.code === 'P2025') return { success: false, error: "Registro no encontrado." };
  // }

  // Error genérico
  // const message = e instanceof Error ? e.message : "Error desconocido";
  return { success: false, error: "No se pudo completar la operación." };
}
