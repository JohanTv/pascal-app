"use server";

import { revalidatePath } from "next/cache";
import * as ChatService from "@/services/chat.service";
import * as LeadService from "@/services/lead.service";
import type { StartConversation } from "@/types/chat.schemas";

/**
 * Start a new conversation (Lead capture + first message)
 * Handles smart handshake and identity reconciliation
 */
export async function startConversationAction(data: StartConversation) {
  const result = await ChatService.startConversation(data);

  if (result.success) {
    // Revalidate agent dashboard to show new lead in queue
    revalidatePath("/intranet/sales-agent/chats");
    revalidatePath("/intranet/admin/chats");
  }

  return result;
}

/**
 * Send a message from a lead in an existing conversation
 */
export async function sendMessageAction(
  conversationId: string,
  content: string,
) {
  return await ChatService.sendMessage(conversationId, content, "LEAD");
}

/**
 * Get all messages for a conversation
 * Client-side wrapper for reading messages
 */
export async function getMessagesAction(conversationId: string) {
  return await ChatService.getConversationMessages(conversationId);
}

/**
 * Check lead status for smart handshake
 * Returns whether lead exists and has active conversation
 */
export async function checkLeadStatusAction(leadId: string) {
  return await LeadService.getLeadStatus(leadId);
}

/**
 * Get conversation details
 * Used by public chat interface
 */
export async function getConversationAction(conversationId: string) {
  return await ChatService.getConversationById(conversationId);
}
