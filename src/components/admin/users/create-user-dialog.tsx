"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createUserAction } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/constants";
import { type CreateUser, CreateUserSchema } from "@/lib/schemas/user.schemas";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateUser>({
    resolver: arktypeResolver(CreateUserSchema),
    defaultValues: {
      role: ROLES.SALES_AGENT,
    },
  });

  const password = watch("password");
  const role = watch("role");

  const generatePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generatedPassword = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }

    setValue("password", generatedPassword);
    copyToClipboard(generatedPassword);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Contraseña copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar al portapapeles");
    }
  };

  const onSubmit = async (data: CreateUser) => {
    setIsSubmitting(true);

    const result = await createUserAction(data);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success(
      `Usuario creado exitosamente. Contraseña: ${result.value.generatedPassword}`,
      {
        duration: 10000,
      },
    );

    // Reset form and close dialog
    reset();
    setOpen(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los datos del nuevo usuario. La contraseña se puede generar
            automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nombre
            </Label>
            <Input
              {...register("name")}
              id="name"
              placeholder="Nombre completo"
              className="transition-all"
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">
                {String(errors.name.message)}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              className="transition-all"
            />
            {errors.email && (
              <p className="text-sm font-medium text-destructive">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue("role", value as typeof role)}
            >
              <SelectTrigger id="role">
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

          {/* Password Field with Generator */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Contraseña
            </Label>
            <div className="flex gap-2">
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="transition-all flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
                title="Generar y copiar contraseña"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              {password && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(password)}
                  title="Copiar contraseña"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creando..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
