import { Clock, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/db";

export default async function AdminChatsPage() {
  // Fetch all conversations
  const conversations = await prisma.conversation.findMany({
    include: {
      lead: true,
      agent: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Supervisión de Chats
        </h2>
        <p className="text-muted-foreground">
          Monitorea todas las conversaciones del sistema
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No hay conversaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/intranet/admin/chats/${conversation.id}`}
              className="transition-transform hover:scale-105"
            >
              <Card className="h-full cursor-pointer hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {conversation.lead.name || "Lead sin nombre"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {conversation.lead.email}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        conversation.status === "QUEUED"
                          ? "secondary"
                          : conversation.status === "IN_PROGRESS"
                            ? "default"
                            : "outline"
                      }
                    >
                      {conversation.status === "QUEUED"
                        ? "En cola"
                        : conversation.status === "IN_PROGRESS"
                          ? "En progreso"
                          : "Resuelto"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <p>Agente: {conversation.agent?.name || "No asignado"}</p>
                    <p className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3" />
                      {new Date(conversation.createdAt).toLocaleString("es-PE")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
