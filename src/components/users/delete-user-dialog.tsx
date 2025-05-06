"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { deleteUser, User } from "@/services/user";

interface DeleteUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export function DeleteUserDialog({
  open,
  setOpen,
  user,
}: DeleteUserDialogProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Simuler la suppression d'un utilisateur (à remplacer par l'appel API réel)
      // await deleteUser(user.id)
      await deleteUser(user.id);

      // Rafraîchir la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success(`L'utilisateur ${user.name} a été supprimé avec succès`);

      // Fermer le dialogue
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les données associées à{" "}
            {user.name} seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
