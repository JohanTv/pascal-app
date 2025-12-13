"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface QueueUpdatesProps {
  onNewLead?: () => void;
  onConversationAssigned?: (conversationId: string) => void;
}

export function useQueueUpdates({
  onNewLead,
  onConversationAssigned,
}: QueueUpdatesProps = {}) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("pusher-js").then(({ default: Pusher }) => {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "", {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
        authEndpoint: "/api/pusher/auth",
      });

      const channel = pusher.subscribe("agents-dashboard");

      channel.bind("pusher:subscription_succeeded", () => {
        setIsConnected(true);
      });

      // New lead in queue
      channel.bind(
        "new-lead",
        (data: {
          conversationId: string;
          leadName: string;
          projectName: string;
          timestamp: Date;
        }) => {
          toast.info(`Nuevo lead: ${data.leadName}`, {
            description: "Un nuevo cliente está esperando asistencia",
          });

          if (onNewLead) {
            onNewLead();
          }
        },
      );

      // Conversation assigned to agent
      channel.bind(
        "conversation-assigned",
        (data: { conversationId: string; agentId: string }) => {
          if (onConversationAssigned) {
            onConversationAssigned(data.conversationId);
          }
        },
      );

      return () => {
        channel.unbind_all();
        pusher.unsubscribe("agents-dashboard");
      };
    });
  }, [onNewLead, onConversationAssigned]);

  return { isConnected };
}
