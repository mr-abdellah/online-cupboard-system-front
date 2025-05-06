"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deactivateUser } from "@/services/user";
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

interface DeactivateUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export function DeactivateUserDialog({
  open,
  setOpen,
  user,
}: DeactivateUserDialogProps) {
  const queryClient = useQueryClient();
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    setIsDeactivating(true);

    try {
      await deactivateUser(user.id);

      // Rafraîchir la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success(`L'utilisateur ${user.name} a été désactivé avec succès`);

      // Fermer le dialogue
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la désactivation de l'utilisateur");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Désactiver cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de désactiver le compte de {user.name}.
            L'utilisateur ne pourra plus se connecter à l'application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isDeactivating}
          >
            {isDeactivating ? "Désactivation..." : "Désactiver"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
