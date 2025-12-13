import { type } from "arktype";

// ===================================================================
// CHAT SCHEMAS - For starting conversations and sending messages
// ===================================================================

// Schema for starting a new conversation (Lead capture + first message)
export const StartConversationSchema = type({
  leadId: type("string").configure({
    message: "ID de lead requerido.",
  }),
  name: type("string >= 2").configure({
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: type("string.email").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  phone: type("string >= 9").configure({
    message: "El teléfono debe tener al menos 9 dígitos.",
  }),
  projectId: type("string | undefined").configure({
    message: "ID de proyecto inválido.",
  }),
  message: type("string >= 1").configure({
    message: "El mensaje no puede estar vacío.",
  }),
});

// Schema for sending a message in an existing conversation
export const SendMessageSchema = type({
  conversationId: type("string >= 1").configure({
    message: "ID de conversación requerido.",
  }),
  content: type("string >= 1").configure({
    message: "El mensaje no puede estar vacío.",
  }),
  senderType: type("'LEAD' | 'AGENT' | 'SYSTEM'").configure({
    message: "Tipo de remitente inválido.",
  }),
});

// Schema for checking lead status
export const CheckLeadStatusSchema = type({
  leadId: type("string").configure({
    message: "ID de lead requerido.",
  }),
});

// ===================================================================
// TYPE INFERENCE - Use these types in your code
// ===================================================================

export type StartConversation = typeof StartConversationSchema.infer;
export type SendMessage = typeof SendMessageSchema.infer;
export type CheckLeadStatus = typeof CheckLeadStatusSchema.infer;
