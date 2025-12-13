"use server";

import { type } from "arktype";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { User } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import {
  BanUserSchema,
  CreateUserSchema,
  ReactivateUserSchema,
  UpdateUserSchema,
} from "@/lib/schemas/user.schemas";
import * as UserService from "@/services/user.service";
import type { Result } from "@/types/result.types";

/**
 * Create a new user with Better-Auth password hashing
 */
export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<Result<User & { generatedPassword: string }>> {
  try {
    // 1. Check authorization (admin only)
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "No autorizado. Solo administradores pueden crear usuarios.",
      };
    }

    // 2. Validate input
    const validation = CreateUserSchema(data);

    if (validation instanceof type.errors) {
      return {
        success: false,
        error: validation.summary || "Datos de usuario inválidos.",
      };
    }

    // 3. Call service
    const result = await UserService.create(data);

    if (!result.success) {
      return result;
    }

    // 4. Revalidate path
    revalidatePath(ROUTES.INTRANET.ADMIN.USERS);

    return result;
  } catch (error: unknown) {
    console.error("[CREATE_USER_ERROR]", error);

    let message = "Error al crear el usuario.";
    if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: message };
  }
}

/**
 * Update user details
 */
export async function updateUserAction(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
  },
): Promise<Result<User>> {
  try {
    // 1. Check authorization
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "No autorizado. Solo administradores pueden editar usuarios.",
      };
    }

    // 2. Validate input
    const validation = UpdateUserSchema({ id, ...data });

    if (validation instanceof type.errors) {
      return {
        success: false,
        error: validation.summary || "Datos de actualización inválidos.",
      };
    }

    // 3. Call service
    const result = await UserService.update(id, data);

    if (!result.success) {
      return result;
    }

    // 4. Revalidate path
    revalidatePath(ROUTES.INTRANET.ADMIN.USERS);

    return result;
  } catch (error: unknown) {
    console.error("[UPDATE_USER_ERROR]", error);

    let message = "Error al actualizar el usuario.";
    if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: message };
  }
}

/**
 * Ban a user with optional reason and expiration
 */
export async function banUserAction(
  id: string,
  reason?: string,
  expires?: Date,
): Promise<Result<User>> {
  try {
    // 1. Check authorization
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "No autorizado. Solo administradores pueden banear usuarios.",
      };
    }

    // 2. Validate input
    const validation = BanUserSchema({
      id,
      banReason: reason,
      banExpires: expires,
    });

    if (validation instanceof type.errors) {
      return {
        success: false,
        error: validation.summary || "Datos de baneo inválidos.",
      };
    }

    // 3. Call service
    const result = await UserService.ban(id, reason, expires);

    if (!result.success) {
      return result;
    }

    // 4. Revalidate path
    revalidatePath(ROUTES.INTRANET.ADMIN.USERS);

    return result;
  } catch (error: unknown) {
    console.error("[BAN_USER_ERROR]", error);

    let message = "Error al banear el usuario.";
    if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: message };
  }
}

/**
 * Reactivate a banned user
 */
export async function reactivateUserAction(id: string): Promise<Result<User>> {
  try {
    // 1. Check authorization
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "No autorizado. Solo administradores pueden reactivar usuarios.",
      };
    }

    // 2. Validate input
    const validation = ReactivateUserSchema({ id });

    if (validation instanceof type.errors) {
      return {
        success: false,
        error: validation.summary || "ID de usuario inválido.",
      };
    }

    // 3. Call service
    const result = await UserService.reactivate(id);

    if (!result.success) {
      return result;
    }

    // 4. Revalidate path
    revalidatePath(ROUTES.INTRANET.ADMIN.USERS);

    return result;
  } catch (error: unknown) {
    console.error("[REACTIVATE_USER_ERROR]", error);

    let message = "Error al reactivar el usuario.";
    if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: message };
  }
}
