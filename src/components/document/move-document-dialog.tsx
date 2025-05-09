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
import { getCupboard, getAllCupboards } from "@/services/cupboard";
import { changeDocumentBinder } from "@/services/document";
import { FiLoader } from "react-icons/fi";
import FolderIcon from "@/assets/folder.svg";
import BinderIcon from "@/assets/binder.png";

interface MoveDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  documentTitle: string | null;
  currentBinderId: string | null;
}

export function MoveDocumentDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  currentBinderId,
}: MoveDocumentDialogProps) {
  const queryClient = useQueryClient();
  const [selectedCupboardId, setSelectedCupboardId] = useState<string>("");
  const [selectedBinderId, setSelectedBinderId] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);

  // Récupérer la liste des armoires
  const { data: cupboards, isLoading: isLoadingCupboards } = useQuery({
    queryKey: ["cupboards"],
    queryFn: () => getAllCupboards(),
    enabled: open,
  });

  // Récupérer les classeurs de l'armoire sélectionnée
  const { data: selectedCupboard, isLoading: isLoadingBinders } = useQuery({
    queryKey: ["cupboard", selectedCupboardId],
    queryFn: () => getCupboard(selectedCupboardId),
    enabled: !!selectedCupboardId && open,
  });

  // Réinitialiser les sélections lorsque le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setSelectedCupboardId("");
      setSelectedBinderId("");
    }
  }, [open]);

  // Fonction pour déplacer le document
  const handleMoveDocument = async () => {
    if (!documentId || !selectedBinderId) return;

    setIsMoving(true);

    try {
      await changeDocumentBinder(documentId, selectedBinderId);

      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ["binder", currentBinderId] });
      queryClient.invalidateQueries({ queryKey: ["binder", selectedBinderId] });

      toast.success(`Le document a été déplacé avec succès`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors du déplacement du document");
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Déplacer le document</DialogTitle>
          <DialogDescription>
            Sélectionnez un classeur de destination pour déplacer{" "}
            <span className="font-medium">{documentTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Armoire de destination
            </label>
            <Select
              value={selectedCupboardId}
              onValueChange={(value) => {
                setSelectedCupboardId(value);
                setSelectedBinderId("");
              }}
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
                  cupboards.map((cupboard) => (
                    <SelectItem key={cupboard.id} value={cupboard.id}>
                      <div className="flex items-center">
                        <img
                          src={FolderIcon}
                          alt="Binder Icon"
                          className="w-4 h-4 mr-2"
                        />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Classeur de destination
            </label>
            <Select
              value={selectedBinderId}
              onValueChange={setSelectedBinderId}
              disabled={!selectedCupboardId || isLoadingBinders}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un classeur" />
              </SelectTrigger>
              <SelectContent>
                {!selectedCupboardId ? (
                  <div className="p-2 text-sm text-gray-500">
                    Sélectionnez d'abord une armoire
                  </div>
                ) : isLoadingBinders ? (
                  <div className="flex items-center justify-center p-2">
                    <FiLoader className="animate-spin mr-2" />
                    <span>Chargement...</span>
                  </div>
                ) : selectedCupboard &&
                  selectedCupboard.binders &&
                  selectedCupboard.binders.length > 0 ? (
                  selectedCupboard.binders
                    .filter((binder) => binder.id !== currentBinderId) // Exclure le classeur actuel
                    .map((binder) => (
                      <SelectItem key={binder.id} value={binder.id}>
                        <div className="flex items-center">
                          <img
                            src={BinderIcon}
                            alt="Binder Icon"
                            className="w-4 h-4 mr-2"
                          />
                          {binder.name}
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    Aucun classeur disponible
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
            onClick={handleMoveDocument}
            disabled={!selectedBinderId || isMoving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isMoving ? "Déplacement..." : "Déplacer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
