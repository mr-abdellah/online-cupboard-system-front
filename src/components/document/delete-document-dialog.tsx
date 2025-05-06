"use client";

import { useState } from "react";
import { deleteDocument } from "@/services/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDocumentDialogProps {
  documentId: string | null;
  documentTitle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDocumentDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: DeleteDocumentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      // Invalidate and refetch the binder query to update the UI
      queryClient.invalidateQueries({ queryKey: ["binder"] });
      onOpenChange(false);
      setIsDeleting(false);
    },
    onError: (error) => {
      console.error("Error deleting document:", error);
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (!documentId) return;

    setIsDeleting(true);
    deleteDocumentMutation.mutate(documentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supprimer le document</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce document ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium text-gray-700">
            Document :{" "}
            <span className="font-bold">
              {documentTitle || "Document sans titre"}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
