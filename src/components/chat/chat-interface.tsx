"use client";

import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getMessagesAction, sendMessageAction } from "@/actions/chat.actions";
import type { Message } from "@/generated/prisma/client";

interface ChatInterfaceProps {
  conversationId: string | null;
  leadId?: string;
}

export function ChatInterface({ conversationId, leadId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      const result = await getMessagesAction(conversationId);

      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      setMessages(result.value);
      setIsLoading(false);
    };

    loadMessages();
  }, [conversationId]);

  // Real-time message updates via Pusher
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `private-chat-${conversationId}`;

    // Dynamic import to avoid SSR issues
    import("pusher-js").then(({ default: Pusher }) => {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "", {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
        authEndpoint: "/api/pusher/auth",
        auth: {
          params: {
            user_id: leadId,
          },
        },
      });

      const channel = pusher.subscribe(channelName);

      channel.bind("new-message", (newMessage: Message) => {
        setMessages((prev) => {
          // Avoid duplicates (optimistic updates)
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
      };
    });
  }, [conversationId, leadId]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversationId) return;

    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage("");

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      senderType: "LEAD",
      conversationId,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
      attachmentUrl: null,
      metadata: null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const result = await sendMessageAction(conversationId, messageContent);

    if (!result.success) {
      toast.error(result.error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(messageContent); // Restore message
    } else {
      // Success: Handle race condition with Pusher
      const realMessage = result.value;
      setMessages((prev) => {
        // Check if Pusher already added the real message
        const alreadyExists = prev.some((m) => m.id === realMessage.id);

        if (alreadyExists) {
          // Pusher won the race: just remove the optimistic one
          return prev.filter((m) => m.id !== tempId);
        }

        // We won the race: replace optimistic with real
        return prev.map((m) => (m.id === tempId ? realMessage : m));
      });
    }

    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No hay mensajes aún. ¡Empieza la conversación!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderType === "LEAD" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.senderType === "LEAD"
                    ? "bg-yellow text-blue-dark"
                    : message.senderType === "SYSTEM"
                      ? "bg-muted text-muted-foreground text-center italic text-sm"
                      : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    message.senderType === "LEAD"
                      ? "text-blue-dark/70"
                      : "opacity-70"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="rounded-lg bg-yellow px-4 py-2 font-semibold text-blue-dark transition-colors hover:bg-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
