"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import {
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { reactivateUserAction, updateUserAction } from "@/actions/user.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { User as PrismaUser } from "@/generated/prisma/client";
import { ROLES } from "@/lib/constants";
import {
  type UpdateUserForm,
  UpdateUserFormSchema,
} from "@/lib/schemas/user.schemas";
import { BanUserDialog } from "./ban-user-dialog";

interface UserDetailDrawerProps {
  user: PrismaUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({
  user,
  open,
  onOpenChange,
}: UserDetailDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateUserForm>({
    resolver: arktypeResolver(UpdateUserFormSchema),
    values: user
      ? {
          name: user.name,
          email: user.email,
          role: (user.role || ROLES.SALES_AGENT) as
            | "admin"
            | "sales_agent"
            | "user",
        }
      : undefined,
  });

  const role = watch("role");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (roleValue: string | null | undefined) => {
    switch (roleValue) {
      case ROLES.ADMIN:
        return "Administrador";
      case ROLES.SALES_AGENT:
        return "Agente de Ventas";
      case ROLES.USER:
        return "Usuario";
      default:
        return "Usuario";
    }
  };

  const onSubmit = async (data: UpdateUserForm) => {
    if (!user) return;

    setIsSubmitting(true);

    const result = await updateUserAction(user.id, data);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Usuario actualizado exitosamente");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleReactivate = async () => {
    if (!user) return;

    setIsSubmitting(true);

    const result = await reactivateUserAction(user.id);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success(`Usuario ${user.name} reactivado exitosamente`);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>Detalle del Usuario</SheetTitle>
            <SheetDescription>
              Edita la información del usuario y gestiona su estado
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2">
                  {user.banned ? (
                    <Badge variant="destructive">Baneado</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      Activo
                    </Badge>
                  )}
                  <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                </div>
              </div>
            </div>

            {/* Ban Info (if banned) */}
            {user.banned && (
              <div className="rounded-md bg-destructive/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Usuario Baneado</span>
                </div>
                {user.banReason && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Razón:</strong> {user.banReason}
                  </p>
                )}
                {user.banExpires && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Expira:</strong>{" "}
                    {new Date(user.banExpires).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Edit Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nombre
                </Label>
                <Input
                  {...register("name")}
                  id="edit-name"
                  placeholder="Nombre completo"
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  {...register("email")}
                  id="edit-email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Rol
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    setValue("role", value as typeof role)
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.SALES_AGENT}>
                      Agente de Ventas
                    </SelectItem>
                    <SelectItem value={ROLES.ADMIN}>Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm font-medium text-destructive">
                    {String(errors.role.message)}
                  </p>
                )}
              </div>

              {/* Save Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-destructive">
                Zona de Peligro
              </h4>
              {user.banned ? (
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleReactivate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Reactivando..." : "Reactivar Usuario"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setBanDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Banear Usuario
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Ban Dialog */}
      <BanUserDialog
        userId={user.id}
        userName={user.name}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onSuccess={() => onOpenChange(false)}
      />
    </>
  );
}
