import "server-only";

import type { User } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type { Result } from "@/types/result.types";
import { handleDbError } from "@/utils/handle-db-error";

// ===================================================================
// USER SERVICE - Business logic for user CRUD operations
// ===================================================================

export interface GetAllUsersOptions {
  page: number;
  pageSize: number;
  filter: "active" | "banned";
  search?: string;
}

export interface GetAllUsersResult {
  users: User[];
  total: number;
  totalPages: number;
}

/**
 * Get all users with pagination, filtering, and search
 */
export const getAll = async (
  options: GetAllUsersOptions,
): Promise<Result<GetAllUsersResult>> => {
  try {
    const { page, pageSize, filter, search } = options;

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build where clause
    const where = {
      banned: filter === "banned",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // Fetch data and count in parallel with transaction
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      value: {
        users,
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleDbError(error) as Result<GetAllUsersResult>;
  }
};

/**
 * Create a new user with Better-Auth password hashing
 * CRITICAL: Uses Better-Auth's Account model to ensure proper scrypt hashing
 */
export const create = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<Result<User & { generatedPassword: string }>> => {
  try {
    // Create user first
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        role: data.role,
        emailVerified: false,
      },
    });

    // Create account with password (Better-Auth will hash it)
    // Note: Better-Auth's Prisma adapter automatically hashes passwords using scrypt
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: data.password, // Better-Auth adapter will hash this
      },
    });

    return {
      success: true,
      value: {
        ...user,
        generatedPassword: data.password, // Return plain password for display
      },
    };
  } catch (error) {
    return handleDbError(error) as Result<User & { generatedPassword: string }>;
  }
};

/**
 * Update user details
 */
export const update = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
  },
): Promise<Result<User>> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return {
      success: true,
      value: user,
    };
  } catch (error) {
    return handleDbError(error) as Result<User>;
  }
};

/**
 * Ban a user with optional reason and expiration
 * Normalizes expiration date to UTC end-of-day for consistency
 */
export const ban = async (
  id: string,
  reason?: string,
  expires?: Date,
): Promise<Result<User>> => {
  try {
    // Normalize expiration to UTC end-of-day if provided
    let normalizedExpires: Date | undefined;
    if (expires) {
      normalizedExpires = new Date(expires);
      normalizedExpires.setUTCHours(23, 59, 59, 999);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: reason,
        banExpires: normalizedExpires,
      },
    });

    return {
      success: true,
      value: user,
    };
  } catch (error) {
    return handleDbError(error) as Result<User>;
  }
};

/**
 * Reactivate a banned user
 */
export const reactivate = async (id: string): Promise<Result<User>> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    return {
      success: true,
      value: user,
    };
  } catch (error) {
    return handleDbError(error) as Result<User>;
  }
};
