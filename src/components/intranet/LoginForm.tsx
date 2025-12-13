"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { Chrome, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth-client";

// Esquema de validación con Arktype
// Todos los campos requieren mensajes personalizados en español (types-and-schemas-guide.md)
const loginSchema = type({
  email: type("string.email").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  password: type("string>=8").configure({
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
});

// Inferencia de tipos desde el esquema
type LoginFormValues = typeof loginSchema.infer;
interface LoginFormProps {
  serverErrorMessage?: string;
}
export default function LoginForm({ serverErrorMessage }: LoginFormProps) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: arktypeResolver(loginSchema),
  });

  useEffect(() => {
    if (serverErrorMessage) {
      // setTimeout(0) empuja la ejecución al final del Event Loop
      // asegurando que el <Toaster /> ya esté montado y escuchando.
      setTimeout(() => {
        toast.error(serverErrorMessage);
      }, 0);
    }
  }, [serverErrorMessage]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      // OAuth redirige automáticamente a Google
      // Después del callback, el Server Component redirige según el rol
      await signInWithGoogle();
    } catch {
      // Si hay error (usuario cancela, red, etc), mostrar mensaje
      toast.error("No se pudo iniciar sesión con Google.");
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signInWithEmail(data.email, data.password);

    // Guard Clause: Error -> Toast (error-handling.md)
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    // Success - refrescar para que el Server Component redirija según el rol
    toast.success("Bienvenido!");
    router.refresh();
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold md:text-3xl">
          Acceso Corporativo
        </CardTitle>
        <CardDescription>
          Inicia sesión con tu cuenta autorizada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              {...register("email")}
              disabled={isSubmitting || isGoogleLoading}
            />
            {/* Error de Validación -> Inline */}
            {errors.email && (
              <p className="text-sm text-destructive">
                {String(errors.email.message)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting || isGoogleLoading}
            />
            {/* Error de Validación -> Inline */}
            {errors.password && (
              <p className="text-sm text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || isGoogleLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              <Chrome className="mr-2 h-5 w-5" />
              Continuar con Google
            </>
          )}
        </Button>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ¿No tienes acceso? Contacta al administrador para ser dado de alta.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
