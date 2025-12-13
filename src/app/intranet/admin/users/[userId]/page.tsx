import { Calendar, Mail, UserCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/db";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Detalles del Usuario
        </h2>
        <p className="text-muted-foreground">
          Información completa del usuario
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </CardDescription>
            </div>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "Admin" : "Agente"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Estado de Verificación</h4>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {user.emailVerified
                    ? "Email verificado"
                    : "Email sin verificar"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Fecha de Registro</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString("es-PE")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Estado del Usuario</h4>
            <Badge variant={user.banned ? "destructive" : "default"}>
              {user.banned ? "Baneado" : "Activo"}
            </Badge>
            {user.banReason && (
              <p className="text-sm text-muted-foreground mt-2">
                Razón: {user.banReason}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
