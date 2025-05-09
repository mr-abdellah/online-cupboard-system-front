"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCupboards } from "@/services/cupboard";
import { changeBinderCupboard } from "@/services/binder";
import { FiFolder, FiLoader } from "react-icons/fi";
import type { BinderResponse } from "@/services/binder";

interface MoveBinderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binder: BinderResponse | null;
}

export function MoveBinderDialog({
  open,
  onOpenChange,
  binder,
}: MoveBinderDialogProps) {
  const queryClient = useQueryClient();
  const [selectedCupboardId, setSelectedCupboardId] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);

  // Récupérer la liste des armoires
  const { data: cupboards, isLoading: isLoadingCupboards } = useQuery({
    queryKey: ["cupboards"],
    queryFn: () => getAllCupboards(),
    enabled: open,
  });

  // Réinitialiser les sélections lorsque le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setSelectedCupboardId("");
    }
  }, [open]);

  // Fonction pour déplacer le classeur
  const handleMoveBinder = async () => {
    if (!binder || !selectedCupboardId) return;

    setIsMoving(true);

    try {
      await changeBinderCupboard(binder.id, selectedCupboardId);

      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ["cupboards"] });

      toast.success(`Le classeur a été déplacé avec succès`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors du déplacement du classeur");
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Déplacer le classeur</DialogTitle>
          <DialogDescription>
            Sélectionnez une armoire de destination pour déplacer le classeur{" "}
            <span className="font-medium">{binder?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Armoire de destination
            </label>
            <Select
              value={selectedCupboardId}
              onValueChange={setSelectedCupboardId}
              disabled={isLoadingCupboards}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une armoire" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCupboards ? (
                  <div className="flex items-center justify-center p-2">
                    <FiLoader className="animate-spin mr-2" />
                    <span>Chargement...</span>
                  </div>
                ) : cupboards && cupboards.length > 0 ? (
                  cupboards
                    .filter((cupboard) => cupboard.id !== binder?.cupboard_id) // Exclure l'armoire actuelle
                    .map((cupboard) => (
                      <SelectItem key={cupboard.id} value={cupboard.id}>
                        <div className="flex items-center">
                          <FiFolder className="mr-2 text-blue-500" />
                          {cupboard.name}
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    Aucune armoire disponible
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleMoveBinder}
            disabled={!selectedCupboardId || isMoving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isMoving ? "Déplacement..." : "Déplacer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
