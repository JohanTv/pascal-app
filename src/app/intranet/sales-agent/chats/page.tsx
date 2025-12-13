import { Suspense } from "react";
import { MyConversationsList } from "@/components/chat-workspace/my-conversations-list";
import { QueueList } from "@/components/chat-workspace/queue-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentChatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Chats</h2>
        <p className="text-muted-foreground">
          Administra las conversaciones con clientes
        </p>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">En Cola</TabsTrigger>
          <TabsTrigger value="my-chats">Mis Conversaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <QueueList />
          </Suspense>
        </TabsContent>

        <TabsContent value="my-chats" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <MyConversationsList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
