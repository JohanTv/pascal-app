import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import pusherServer from "@/lib/pusher";

export async function POST(req: Request) {
  const data = await req.formData();
  const socketId = data.get("socket_id") as string;
  const channel = data.get("channel_name") as string;

  // El ID que el cliente DICE tener (del localStorage)
  const storedLeadId = data.get("user_id") as string;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Estructura de usuario para Pusher Presence
  type UserPresence = {
    user_id: string;
    user_info: {
      name: string;
      role: string;
      email?: string;
    };
  };

  let userData: UserPresence;

  if (session) {
    // ---------------------------------------------------------
    // CASO A: ES UN AGENTE (Usuario Logueado)
    // ---------------------------------------------------------
    userData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || "Agente",
        role: session.user.role || ROLES.SALES_AGENT,
        email: session.user.email,
      },
    };
  } else {
    // ---------------------------------------------------------
    // CASO B: ES UN LEAD (Visitante Público)
    // ---------------------------------------------------------

    // 1. Validar que tengamos un ID
    if (!storedLeadId) {
      return new NextResponse("ID de Lead requerido", { status: 403 });
    }

    const finalLeadId = storedLeadId;

    // 2. Validar que sea un canal de chat privado
    if (!channel.startsWith("private-chat-")) {
      return new NextResponse("Tipo de canal no autorizado para visitantes", {
        status: 403,
      });
    }

    // 3. Extraer Conversation ID del canal
    const conversationId = channel.replace("private-chat-", "");

    if (!conversationId) {
      return new NextResponse("ID de conversación inválido", { status: 400 });
    }

    // 4. VERIFICACIÓN REAL: Consultar BD para ver si este Lead es dueño de esta Conversación
    // IMPORTANTE: Esto evita que un Lead escuche chats de otros
    try {
      // Necesitamos importar prisma para esta verificación de seguridad
      const prisma = (await import("@/lib/db")).default;

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { leadId: true },
      });

      if (!conversation) {
        return new NextResponse("Conversación no encontrada", { status: 404 });
      }

      if (conversation.leadId !== finalLeadId) {
        console.warn(
          `🚨 ALERTA DE SEGURIDAD: Lead ${finalLeadId} intentó entrar a chat ${conversationId} que pertenece a ${conversation.leadId}`,
        );
        return new NextResponse("No tienes permiso para ver este chat", {
          status: 403,
        });
      }
    } catch (error) {
      console.error("Error verificando propiedad del chat:", error);
      return new NextResponse("Error interno de validación", { status: 500 });
    }

    // Si pasó todas las validaciones
    userData = {
      user_id: finalLeadId,
      user_info: {
        name: "Visitante",
        role: "LEAD",
      },
    };
  }

  try {
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      userData,
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher Auth Error:", error);
    return new NextResponse("Error interno de autorización", { status: 500 });
  }
}
