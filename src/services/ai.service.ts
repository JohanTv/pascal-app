import "server-only";

import { type } from "arktype";
import OpenAI from "openai";
import { SenderType } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import pusherServer from "@/lib/pusher";
import type { Result } from "@/types/result.types";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the output schema using ArkType
const AnalysisSchema = type({
  summary: "string",
  tags: "string[]",
  priority: "'HIGH' | 'MEDIUM' | 'LOW'",
});

type AnalysisResult = typeof AnalysisSchema.infer;

/**
 * Analyzes a conversation history using OpenAI to extract summary, tags, and priority.
 * This function is designed to be fire-and-forget (void return or Result that is not awaited).
 */
export const analyzeConversation = async (
  conversationId: string,
): Promise<Result<AnalysisResult>> => {
  try {
    // 1. Fetch Conversation and Messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      console.error(`[AI] Conversation not found: ${conversationId}`);
      return { success: false, error: "Conversation not found" };
    }

    // 2. Pre-process History
    const history = conversation.messages
      .map((msg) => {
        if (msg.senderType === SenderType.LEAD)
          return `Prospecto: ${msg.content}`;
        if (msg.senderType === SenderType.AGENT)
          return `Agente: ${msg.content}`;
        return null; // Ignore SYSTEM messages
      })
      .filter(Boolean)
      .join("\n");

    if (!history) {
      return { success: false, error: "No relevant messages to analyze" };
    }

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or "gpt-3.5-turbo" if preferred
      messages: [
        {
          role: "system",
          content: `Role: You are an expert Real Estate Lead Analyst.
Task: Analyze the chat history between a "Agente" (Sales Rep) and a "Prospecto" (Lead).

Output JSON Schema:
{
  "summary": "String. Resumen conciso de negocio en ESPAÑOL (máx 2 oraciones). Enfócate en necesidades: presupuesto, ubicación, tipo, tiempo.",
  "tags": "String Array. Select max 3 from allowed list.",
  "priority": "String. Enum: 'HIGH', 'MEDIUM', 'LOW'."
}

Business Rules:
1. PRIORITY:
    - 'HIGH': Intent to visit/tour, discusses contract/payment, specific budget ready, or high urgency.
    - 'MEDIUM': Asking about price, location, photos, or amenities. Exploring phase.
    - 'LOW': Unresponsive, greeting only, just looking, or stated lack of interest.

2. ALLOWED TAGS (Strict):
    - 'hot-lead' (Ready to buy/rent)
    - 'schedule-request' (Wants to visit)
    - 'pricing-query' (Asking about cost)
    - 'location-query' (Asking about area)
    - 'objection' (Price too high, doesn't like feature)
    - 'competitor-mention'
    - 'follow-up-needed'

3. SUMMARY:
    - Provide actionable info in SPANISH. Example: "Busca depa 2hab en Centro, ppt $150k. Quiere visitar el lunes."`,
        },
        {
          role: "user",
          content: history,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // 4. Validate Response
    const parsedData = JSON.parse(content);
    const validation = AnalysisSchema(parsedData);

    if (validation instanceof type.errors) {
      console.error("[AI] Validation failed:", validation.summary);
      return { success: false, error: validation.summary };
    }

    const analysis = parsedData as AnalysisResult;

    // 5. Update Database
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        aiSummary: analysis.summary,
        aiTags: analysis.tags,
        priority: analysis.priority,
      },
    });

    // 6. Trigger Real-time Update via Pusher
    // We emit 'conversation:updated' with the full updated object or just the delta.
    // Let's emit the specific analysis result so client can patch it.
    await pusherServer.trigger(
      `private-chat-${conversationId}`,
      "conversation:updated",
      {
        id: conversationId,
        aiSummary: analysis.summary,
        aiTags: analysis.tags,
        priority: analysis.priority,
      },
    );

    // Also notify agents dashboard if priority changed or generic update
    await pusherServer.trigger("agents-dashboard", "conversation:updated", {
      id: conversationId,
      priority: analysis.priority,
      aiSummary: analysis.summary,
    });

    return { success: true, value: analysis };
  } catch (error) {
    console.error("[AI] Analysis failed:", error);
    // Do not throw, just return failure
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown AI error",
    };
  }
};
