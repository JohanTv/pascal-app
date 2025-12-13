"use client";

import { Loader2, Mail, Phone, Send, UserCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  assignConversationToAgent,
  getConversationByIdAction,
  sendAgentMessageAction,
} from "@/actions/agent-chat.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Conversation, Lead, Message } from "@/generated/prisma/client";

interface ChatWorkspaceProps {
  mode: "agent" | "admin";
}

export function ChatWorkspace({ mode }: ChatWorkspaceProps) {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<
    | (Conversation & {
        lead: Lead;
        messages: Message[];
      })
    | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTakingChat, setIsTakingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConversation = async () => {
      const result = await getConversationByIdAction(conversationId);

      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      const data = result.value;

      if (!data) {
        toast.error("Conversación no encontrada");
        router.push("/intranet/sales-agent/chats");
        return;
      }

      setConversation(data);
      setMessages(data.messages);
      setIsLoading(false);
    };

    loadConversation();
  }, [conversationId, router]);

  // Real-time message updates via Pusher
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `private-chat-${conversationId}`;

    // Dynamic import to avoid SSR issues
    import("pusher-js").then(({ default: Pusher }) => {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "", {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
        authEndpoint: "/api/pusher/auth",
      });

      const channel = pusher.subscribe(channelName);

      // New message handler
      channel.bind("new-message", (newMessage: Message) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      });

      // Agent joined handler
      channel.bind(
        "agent-joined",
        (data: { agentName: string; agentId: string }) => {
          toast.success(`${data.agentName} se ha unido al chat`);
        },
      );

      // Conversation updated (AI analysis results)
      // Define a type for the update payload
      type ConversationUpdatePayload = {
        id: string;
        aiSummary?: string;
        aiTags?: string[];
        priority?: string;
      };

      channel.bind(
        "conversation:updated",
        (data: ConversationUpdatePayload) => {
          setConversation((prev) => {
            if (!prev) return null;
            if (prev.id !== data.id && data.id) return prev; // Safety check

            // If ID matches or handled generally
            return {
              ...prev,
              aiSummary: data.aiSummary ?? prev.aiSummary,
              aiTags: data.aiTags ?? prev.aiTags,
              priority: data.priority ?? prev.priority,
            };
          });
        },
      );

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
      };
    });
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleTakeChat = async () => {
    setIsTakingChat(true);

    const result = await assignConversationToAgent(conversationId);

    if (!result.success) {
      toast.error(result.error);
      setIsTakingChat(false);
      return;
    }

    toast.success("Chat asignado exitosamente");

    // Reload conversation
    const updatedResult = await getConversationByIdAction(conversationId);
    if (updatedResult.success) {
      if (updatedResult.value) {
        setConversation(updatedResult.value);
        setMessages(updatedResult.value.messages);
      }
    }

    setIsTakingChat(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage("");

    // Optimistically add message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      senderType: "AGENT",
      conversationId,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
      attachmentUrl: null,
      metadata: null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const result = await sendAgentMessageAction(conversationId, messageContent);

    if (!result.success) {
      toast.error(result.error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(messageContent);
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

        // We won range: swap optimistic for real
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

  if (!conversation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversación no encontrada</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const isQueued = conversation.status === "QUEUED";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Lead Info Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Información del Lead</CardTitle>
          <CardDescription>Datos de contacto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {conversation.lead.name || "Sin nombre"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{conversation.lead.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{conversation.lead.phone || "No especificado"}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>

              <Badge variant={isQueued ? "secondary" : "default"}>
                {isQueued ? "En cola" : "En progreso"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prioridad:</span>
              <Badge
                variant={
                  conversation.priority === "HIGH"
                    ? "destructive"
                    : conversation.priority === "MEDIUM"
                      ? "secondary"
                      : "outline"
                }
                className={
                  conversation.priority === "HIGH"
                    ? "bg-red-500 hover:bg-red-600"
                    : conversation.priority === "MEDIUM"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : ""
                }
              >
                {conversation.priority || "NORMAL"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado:</span>
              <span>
                {new Date(conversation.createdAt).toLocaleString("es-PE")}
              </span>
            </div>
          </div>

          <Separator />

          {/* AI Insights Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Análisis IA</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                BETA
              </span>
            </div>

            {conversation.aiSummary && (
              <div className="p-3 bg-muted/50 rounded-lg text-xs leading-relaxed border border-border">
                <p className="font-medium mb-1 text-muted-foreground">
                  Resumen:
                </p>
                {conversation.aiSummary}
              </div>
            )}

            {conversation.aiTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {conversation.aiTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] h-5 px-2"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {!conversation.aiSummary &&
              (conversation.aiTags?.length ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Esperando análisis de la conversación...
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>Conversación</CardTitle>
          <CardDescription>
            {isQueued
              ? "Este chat está en cola. Tómalo para comenzar."
              : "Chat en progreso"}
          </CardDescription>
        </CardHeader>

        {isQueued && mode === "agent" && (
          <CardContent>
            <Button
              onClick={handleTakeChat}
              disabled={isTakingChat}
              className="w-full"
              size="lg"
            >
              {isTakingChat && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Tomar chat
            </Button>
          </CardContent>
        )}

        {!isQueued && (
          <>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === "AGENT"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.senderType === "AGENT"
                        ? "bg-primary text-primary-foreground"
                        : message.senderType === "SYSTEM"
                          ? "bg-muted text-muted-foreground text-center italic text-sm"
                          : "bg-yellow text-blue-dark"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            <Separator />

            <CardContent className="pt-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
