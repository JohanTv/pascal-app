import "server-only";

import type { Lead } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type { Result } from "@/types/result.types";
import { handleDbError } from "@/utils/handle-db-error";

/**
 * Get lead status and active conversation
 * Used for smart handshake verification
 */
export const getLeadStatus = async (
  leadId: string,
): Promise<
  Result<{
    exists: boolean;
    activeConversationId: string | null;
  }>
> => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        conversations: {
          where: {
            status: { in: ["QUEUED", "IN_PROGRESS"] },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!lead) {
      return {
        success: true,
        value: {
          exists: false,
          activeConversationId: null,
        },
      };
    }

    return {
      success: true,
      value: {
        exists: true,
        activeConversationId: lead.conversations[0]?.id || null,
      },
    };
  } catch (error) {
    return handleDbError(error) as Result<{
      exists: boolean;
      activeConversationId: string | null;
    }>;
  }
};

/**
 * Create or update a lead
 * Uses upsert to handle both creation and updates
 */
export const createOrUpdateLead = async (data: {
  id: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<Result<Lead>> => {
  try {
    const lead = await prisma.lead.upsert({
      where: { id: data.id || "" },
      update: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        lastSeen: new Date(),
      },
      create: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });

    return {
      success: true,
      value: lead,
    };
  } catch (error) {
    return handleDbError(error) as Result<Lead>;
  }
};

/**
 * Update lead's last seen timestamp
 * Called when lead reconnects or sends a message
 */
export const updateLastSeen = async (leadId: string): Promise<Result<Lead>> => {
  try {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { lastSeen: new Date() },
    });

    return {
      success: true,
      value: lead,
    };
  } catch (error) {
    return handleDbError(error) as Result<Lead>;
  }
};

/**
 * Find lead by email
 * Used for identity reconciliation
 */
export const findLeadByEmail = async (
  email: string,
): Promise<Result<Lead | null>> => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { email },
    });

    return {
      success: true,
      value: lead,
    };
  } catch (error) {
    return handleDbError(error) as Result<Lead | null>;
  }
};
