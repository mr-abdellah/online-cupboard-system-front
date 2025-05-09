"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiCheck, FiChevronRight, FiLoader, FiSearch } from "react-icons/fi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CupboardSummary, getAllCupboards } from "@/services/cupboard";
import { copyDocumentToBinders } from "@/services/document";

interface CopyDocumentDialogProps {
  documentId: string | null;
  documentTitle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopyDocumentDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: CopyDocumentDialogProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCupboards, setExpandedCupboards] = useState<
    Record<string, boolean>
  >({});
  const [selectedBinders, setSelectedBinders] = useState<string[]>([]);

  // Récupérer toutes les armoires
  const { data: cupboards, isLoading } = useQuery({
    queryKey: ["all-cupboards"],
    queryFn: getAllCupboards,
    enabled: open,
  });

  // Filtrer les armoires en fonction de la recherche
  const filteredCupboards = cupboards
    ? cupboards.filter(
        (cupboard) =>
          cupboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cupboard.binders?.some((binder) =>
            binder.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

  // Mutation pour copier le document vers les classeurs sélectionnés
  const copyMutation = useMutation({
    mutationFn: () => {
      if (!documentId) throw new Error("ID du document manquant");
      return copyDocumentToBinders(documentId, selectedBinders);
    },
    onSuccess: () => {
      toast.success("Document copié avec succès");
      queryClient.invalidateQueries({ queryKey: ["binder"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la copie du document");
      console.error("Erreur:", error);
    },
  });

  // Réinitialiser les sélections à l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      setSelectedBinders([]);
      setSearchQuery("");
    }
  }, [open]);

  // Basculer l'expansion d'une armoire
  const toggleCupboard = (cupboardId: string) => {
    setExpandedCupboards((prev) => ({
      ...prev,
      [cupboardId]: !prev[cupboardId],
    }));
  };

  // Gérer la sélection/désélection d'un classeur
  const toggleBinder = (binderId: string) => {
    setSelectedBinders((prev) =>
      prev.includes(binderId)
        ? prev.filter((id) => id !== binderId)
        : [...prev, binderId]
    );
  };

  // Sélectionner/désélectionner tous les classeurs d'une armoire
  const toggleAllBindersInCupboard = (
    cupboard: CupboardSummary,
    selected: boolean
  ) => {
    if (!cupboard.binders?.length) return;

    if (selected) {
      // Ajouter tous les classeurs qui ne sont pas déjà sélectionnés
      const binderIdsToAdd = cupboard.binders
        .map((binder) => binder.id)
        .filter((id) => !selectedBinders.includes(id));
      setSelectedBinders((prev) => [...prev, ...binderIdsToAdd]);
    } else {
      // Retirer tous les classeurs de cette armoire
      const binderIdsToRemove = cupboard.binders.map((binder) => binder.id);
      setSelectedBinders((prev) =>
        prev.filter((id) => !binderIdsToRemove.includes(id))
      );
    }
  };

  // Vérifier si tous les classeurs d'une armoire sont sélectionnés
  const areAllBindersSelected = (cupboard: CupboardSummary) => {
    if (!cupboard.binders?.length) return false;
    return cupboard.binders.every((binder) =>
      selectedBinders.includes(binder.id)
    );
  };

  // Vérifier si certains classeurs d'une armoire sont sélectionnés
  const areSomeBindersSelected = (cupboard: CupboardSummary) => {
    if (!cupboard.binders?.length) return false;
    return cupboard.binders.some((binder) =>
      selectedBinders.includes(binder.id)
    );
  };

  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    if (selectedBinders.length === 0) {
      toast.error("Veuillez sélectionner au moins un classeur");
      return;
    }
    copyMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Copier le document vers d'autres classeurs</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">
              Document à copier :
            </p>
            <p className="font-medium">
              {documentTitle || "Document sélectionné"}
            </p>
          </div>

          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une armoire ou un classeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {selectedBinders.length > 0 && (
            <div className="mb-4">
              <Badge variant="secondary" className="mr-2">
                {selectedBinders.length} classeur(s) sélectionné(s)
              </Badge>
            </div>
          )}

          <ScrollArea className="h-[300px] border rounded-md p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <FiLoader className="animate-spin mr-2" />
                <span>Chargement des armoires...</span>
              </div>
            ) : filteredCupboards.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {searchQuery
                  ? "Aucun résultat trouvé"
                  : "Aucune armoire disponible"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCupboards.map((cupboard) => {
                  const isExpanded = expandedCupboards[cupboard.id] || false;
                  const allSelected = areAllBindersSelected(cupboard);
                  const someSelected = areSomeBindersSelected(cupboard);
                  const canManage = cupboard.can_manage !== false;

                  return (
                    <div key={cupboard.id} className="space-y-1">
                      <div className="flex items-center">
                        {canManage &&
                          cupboard.binders &&
                          cupboard.binders.length > 0 && (
                            <Checkbox
                              checked={allSelected}
                              indeterminate={!allSelected && someSelected}
                              onCheckedChange={(checked) =>
                                toggleAllBindersInCupboard(
                                  cupboard,
                                  checked === true
                                )
                              }
                              className="mr-2"
                              disabled={!canManage}
                            />
                          )}
                        <button
                          onClick={() => toggleCupboard(cupboard.id)}
                          className="flex items-center flex-grow text-sm font-medium py-1 hover:bg-muted/50 rounded px-1"
                        >
                          <span className="mr-2 text-muted-foreground">
                            {isExpanded ? (
                              <FiChevronRight className="rotate-90" />
                            ) : (
                              <FiChevronRight />
                            )}
                          </span>
                          <span>{cupboard.name}</span>
                          {!canManage && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Lecture seule
                            </Badge>
                          )}
                        </button>
                      </div>

                      {isExpanded && cupboard.binders && (
                        <div className="ml-6 pl-2 border-l space-y-1">
                          {cupboard.binders.length === 0 ? (
                            <div className="text-xs text-muted-foreground py-1 px-2">
                              Aucun classeur
                            </div>
                          ) : (
                            cupboard.binders.map((binder) => (
                              <div
                                key={binder.id}
                                className="flex items-center py-1 px-1"
                              >
                                <Checkbox
                                  checked={selectedBinders.includes(binder.id)}
                                  onCheckedChange={() =>
                                    toggleBinder(binder.id)
                                  }
                                  className="mr-2"
                                  disabled={!canManage}
                                />
                                <span className="text-sm">{binder.name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      <Separator />
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedBinders.length === 0 || copyMutation.isPending}
            className="flex items-center gap-2"
          >
            {copyMutation.isPending ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiCheck size={16} />
            )}
            Copier vers {selectedBinders.length} classeur(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
