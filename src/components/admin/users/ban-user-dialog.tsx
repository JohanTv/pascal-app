"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { banUserAction } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type BanUserForm,
  BanUserFormSchema,
} from "@/lib/schemas/user.schemas";

interface BanUserDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BanUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: BanUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BanUserForm>({
    resolver: arktypeResolver(BanUserFormSchema),
  });

  const onSubmit = async (data: BanUserForm) => {
    setIsSubmitting(true);

    const result = await banUserAction(userId, data.banReason, data.banExpires);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success(`Usuario ${userName} baneado exitosamente`);

    // Reset form and close dialog
    reset();
    onOpenChange(false);
    setIsSubmitting(false);

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Banear Usuario
          </DialogTitle>
          <DialogDescription>
            Estás a punto de banear a <strong>{userName}</strong>. Esta acción
            impedirá que el usuario acceda al sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="banReason">
              Razón del baneo{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              {...register("banReason")}
              id="banReason"
              placeholder="Describe la razón del baneo..."
              rows={3}
              className="resize-none"
            />
            {errors.banReason && (
              <p className="text-sm font-medium text-destructive">
                {String(errors.banReason.message)}
              </p>
            )}
          </div>

          {/* Expiration Date Field */}
          <div className="space-y-2">
            <Label htmlFor="banExpires" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Fecha de expiración{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              {...register("banExpires", {
                setValueAs: (v) => (v === "" ? undefined : new Date(v)),
              })}
              id="banExpires"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="transition-all"
            />
            <p className="text-xs text-muted-foreground">
              Si no se especifica, el baneo será permanente
            </p>
            {errors.banExpires && (
              <p className="text-sm font-medium text-destructive">
                {String(errors.banExpires.message)}
              </p>
            )}
          </div>

          {/* Warning Alert */}
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Advertencia:</strong> El usuario no podrá iniciar sesión
            hasta que sea reactivado.
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Baneando..." : "Banear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
