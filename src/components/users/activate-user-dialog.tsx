"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { activateUser } from "@/services/user";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/services/user";

interface ActivateUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export function ActivateUserDialog({
  open,
  setOpen,
  user,
}: ActivateUserDialogProps) {
  const queryClient = useQueryClient();
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);

    try {
      await activateUser(user.id);

      // Rafraîchir la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success(`L'utilisateur ${user.name} a été activé avec succès`);

      // Fermer le dialogue
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'activation de l'utilisateur");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point d'activer le compte de {user.name}.
            L'utilisateur pourra se connecter et accéder à l'application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="default"
            onClick={handleActivate}
            disabled={isActivating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isActivating ? "Activation..." : "Activer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
