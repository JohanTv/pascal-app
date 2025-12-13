"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Conversation, Lead, Message } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import pusherServer from "@/lib/pusher";
import * as ChatService from "@/services/chat.service";
import type { Result } from "@/types/result.types";

/**
 * Assign a conversation to an agent with race condition protection
 * Uses Prisma transaction to prevent multiple agents from taking the same chat
 */
export async function assignConversationToAgent(
  conversationId: string,
): Promise<Result<Conversation>> {
  try {
    // 1. Session Verification
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "No autorizado. Debes iniciar sesión." };
    }

    const agentId = session.user.id;
    const agentName = session.user.name || "Agente";

    // 2. Database Transaction with pessimistic locking
    const updatedConversation = await prisma.$transaction(async (tx) => {
      // A. Pessimistic verification (logical lock)
      const currentChat = await tx.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!currentChat) {
        throw new Error("La conversación no existe o fue eliminada.");
      }

      // B. THE GUARD: If already has an agent and it's not me
      if (currentChat.agentId && currentChat.agentId !== agentId) {
        throw new Error("Este chat ya fue tomado por otro agente.");
      }

      // C. Atomic update
      const updated = await tx.conversation.update({
        where: { id: conversationId },
        data: {
          agentId: agentId,
          status: "IN_PROGRESS",
          assignedAt: new Date(),
        },
        include: { lead: true },
      });

      // D. System message
      await tx.message.create({
        data: {
          conversationId,
          content: `${agentName} se ha unido al chat.`,
          senderType: "SYSTEM",
        },
      });

      return updated;
    });

    // 3. Side effects (outside transaction to not block DB)

    // Notify the lead (private channel)
    await pusherServer.trigger(
      `private-chat-${conversationId}`,
      "agent-joined",
      {
        agentName: agentName,
        agentId: agentId,
      },
    );

    // Update global dashboard
    await pusherServer.trigger("agents-dashboard", "conversation-assigned", {
      conversationId: conversationId,
      agentId: agentId,
    });

    // Revalidate pages
    revalidatePath("/intranet/sales-agent/chats");
    revalidatePath("/intranet/admin/chats");

    // 4. Success return
    return { success: true, value: updatedConversation };
  } catch (error: unknown) {
    // 5. Safe error handling
    console.error("[ASSIGN_AGENT_ERROR]", error);

    let message = "Ocurrió un error inesperado al asignar el chat.";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    return { success: false, error: message };
  }
}

/**
 * Send a message as an agent
 */
export async function sendAgentMessageAction(
  conversationId: string,
  content: string,
): Promise<Result<Message>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "No autorizado. Debes iniciar sesión." };
    }

    const result = await ChatService.sendMessage(
      conversationId,
      content,
      "AGENT",
    );

    return result;
  } catch (error: unknown) {
    console.error("[SEND_AGENT_MESSAGE_ERROR]", error);

    let message = "Error al enviar el mensaje.";
    if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: message };
  }
}

/**
 * Get queued conversations for agent dashboard
 */
export async function getQueueAction(): Promise<
  Result<
    (Conversation & {
      lead: Lead;
    })[]
  >
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "No autorizado." };
  }

  return await ChatService.getQueuedConversations();
}

/**
 * Get agent's assigned conversations
 */
export async function getMyConversationsAction(): Promise<
  Result<
    (Conversation & {
      lead: Lead;
    })[]
  >
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "No autorizado." };
  }

  return await ChatService.getAgentConversations(session.user.id);
}

/**
 * Get conversation by ID (protected)
 */
export async function getConversationByIdAction(
  conversationId: string,
): Promise<
  Result<
    | (Conversation & {
        lead: Lead;
        messages: Message[];
      })
    | null
  >
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "No autorizado." };
  }

  return await ChatService.getConversationById(conversationId);
}
