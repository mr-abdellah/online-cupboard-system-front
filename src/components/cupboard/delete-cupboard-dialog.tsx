"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCupboard, type CupboardResponse } from "@/services/cupboard";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteCupboardDialogProps {
  cupboard: CupboardResponse;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteCupboardDialog({
  cupboard,
  open,
  setOpen,
  onSuccess,
}: DeleteCupboardDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await deleteCupboard(cupboard.id);
      await queryClient.invalidateQueries({ queryKey: ["cupboards"] });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Erreur lors de la suppression de l'armoire");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasBindersWarning = cupboard.binders && cupboard.binders.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supprimer l'armoire</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette armoire documentaire ?
            {hasBindersWarning && (
              <div className="mt-2 text-amber-600 font-medium">
                Attention : Cette armoire contient {cupboard.binders?.length}{" "}
                classeur
                {cupboard.binders?.length !== 1 ? "s" : ""}. Tous les classeurs
                et documents associés seront également supprimés.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Cette action est irréversible. Une fois supprimée, l'armoire et son
            contenu ne pourront pas être récupérés.
          </p>
          {error && (
            <div className="mt-2 text-sm text-red-500 text-center">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
