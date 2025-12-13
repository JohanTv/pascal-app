"use client";

import { Clock, User } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getQueueAction } from "@/actions/agent-chat.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Conversation, Lead } from "@/generated/prisma/client";
import { useQueueUpdates } from "@/hooks/use-queue-updates";

export function QueueList() {
  const [queuedChats, setQueuedChats] = useState<
    (Conversation & { lead: Lead })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    const result = await getQueueAction();

    if (!result.success) {
      setError(result.error);
      setQueuedChats([]);
      setIsLoading(false);
      return;
    }

    setQueuedChats(result.value);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Real-time queue updates
  useQueueUpdates({
    onNewLead: () => {
      void loadQueue();
    },
    onConversationAssigned: () => {
      void loadQueue();
    },
  });

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

  if (queuedChats.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No hay leads en cola</p>
          <p className="text-sm text-muted-foreground">
            Los nuevos chats aparecerán aquí
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {queuedChats.map((conversation) => (
        <Card key={conversation.id}>
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
              <Badge variant="secondary">En cola</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversation.aiSummary && (
              <div className="bg-muted/30 p-2 rounded text-xs border border-border/50 text-muted-foreground line-clamp-2">
                <span className="font-semibold">Resumen AI:</span>{" "}
                {conversation.aiSummary}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Teléfono: {conversation.lead.phone || "No especificado"}</p>
              <p className="flex items-center gap-1 mt-2">
                <Clock className="h-3 w-3" />
                {new Date(conversation.createdAt).toLocaleString("es-PE")}
              </p>
            </div>
            <Link href={`/intranet/sales-agent/chats/${conversation.id}`}>
              <Button className="w-full">Tomar chat</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
