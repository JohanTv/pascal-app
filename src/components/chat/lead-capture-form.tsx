"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { Loader2, Mail, MessageSquare, Phone, User } from "lucide-react";
import { useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startConversationAction } from "@/actions/chat.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type StartConversation,
  StartConversationSchema,
} from "@/types/chat.schemas";

interface LeadCaptureFormProps {
  leadId: string;
  onSuccess: (conversationId: string, confirmedLeadId: string) => void;
}

export function LeadCaptureForm({ leadId, onSuccess }: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartConversation>({
    resolver: arktypeResolver(StartConversationSchema),
    defaultValues: {
      leadId,
      projectId: undefined, // Optional field but arktype requires it to be present
    },
  });

  const onSubmit = async (data: StartConversation) => {
    setIsSubmitting(true);

    const result = await startConversationAction(data);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success("¡Conversación iniciada! Un asesor te atenderá pronto.");
    onSuccess(result.value.conversationId, result.value.confirmedLeadId);
    setIsSubmitting(false);
  };

  const onInvalid = (validationErrors: FieldErrors<StartConversation>) => {
    setIsSubmitting(true);
    console.error("❌ Form validation errors:", validationErrors);
    toast.error("Por favor completa todos los campos correctamente");
    setIsSubmitting(false);
  };

  return (
    <Card className="flex h-full flex-col overflow-y-auto border-border/50 p-2 shadow-md md:p-4">
      <CardHeader className="mb-0 space-y-1 px-3 pb-0 pt-0 md:px-6">
        <CardTitle className="text-lg font-bold tracking-tight md:text-2xl">
          ¡Hola! Cuéntanos sobre ti
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pb-0 pt-0 md:p-6 md:pb-0 md:pt-0">
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-3 md:space-y-4"
        >
          {/* Hidden field for projectId - required by schema but optional */}
          <input type="hidden" {...register("projectId")} value={undefined} />

          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Nombre
            </Label>
            <Input
              {...register("name")}
              type="text"
              id="name"
              placeholder="Tu nombre completo"
              className="h-9 transition-all focus-visible:ring-primary md:h-10"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive md:text-sm">
                {String(errors.name.message)}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email
            </Label>
            <Input
              {...register("email")}
              type="email"
              id="email"
              placeholder="tu@email.com"
              className="h-9 transition-all focus-visible:ring-primary md:h-10"
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive md:text-sm">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Teléfono
            </Label>
            <Input
              {...register("phone")}
              type="tel"
              id="phone"
              placeholder="999 999 999"
              className="h-9 transition-all focus-visible:ring-primary md:h-10"
            />
            {errors.phone && (
              <p className="text-xs font-medium text-destructive md:text-sm">
                {String(errors.phone.message)}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="message"
              className="flex items-center gap-2 text-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Mensaje
            </Label>
            <Textarea
              {...register("message")}
              id="message"
              rows={2}
              placeholder="¿En qué podemos ayudarte?"
              className="min-h-[60px] resize-none transition-all focus-visible:ring-primary md:min-h-[80px]"
            />
            {errors.message && (
              <p className="text-xs font-medium text-destructive md:text-sm">
                {String(errors.message.message)}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full border-2 border-yellow-dark bg-yellow font-semibold text-blue-dark transition-all hover:bg-yellow/90 disabled:opacity-50"
            size="default"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Enviando..." : "Iniciar conversación"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
