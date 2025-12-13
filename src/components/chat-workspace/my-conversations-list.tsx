"use client";

import { Clock, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyConversationsAction } from "@/actions/agent-chat.actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Conversation, Lead } from "@/generated/prisma/client";

export function MyConversationsList() {
  const [myConversations, setMyConversations] = useState<
    (Conversation & { lead: Lead })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      const result = await getMyConversationsAction();

      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.value) {
        setMyConversations(result.value);
      }
      setIsLoading(false);
    };

    loadConversations();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p>Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (myConversations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">
            No tienes conversaciones activas
          </p>
          <p className="text-sm text-muted-foreground">
            Toma un chat de la cola para comenzar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {myConversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/intranet/sales-agent/chats/${conversation.id}`}
          className="transition-transform hover:scale-105"
        >
          <Card className="h-full cursor-pointer hover:border-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {conversation.lead.name || "Lead sin nombre"}
                    {conversation.priority === "HIGH" && (
                      <Badge
                        variant="destructive"
                        className="ml-2 text-[10px] h-5 px-1.5"
                      >
                        HIGH
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {conversation.lead.email}
                  </CardDescription>
                  {/* AI Tags Display */}
                  {conversation.aiTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {conversation.aiTags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] h-4 px-1 bg-muted/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant="default">En progreso</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>Teléfono: {conversation.lead.phone || "No especificado"}</p>
                <p className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3" />
                  Asignado:{" "}
                  {conversation.assignedAt
                    ? new Date(conversation.assignedAt).toLocaleString("es-PE")
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
