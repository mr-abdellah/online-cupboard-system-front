"use client";

import { useState } from "react";
import { updateDocument } from "@/services/document";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface UpdateDocumentDialogProps {
  document: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateDocumentDialog({
  document,
  open,
  onOpenChange,
}: UpdateDocumentDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSearchable, setIsSearchable] = useState(true);
  const [tags, setTags] = useState("");
  const queryClient = useQueryClient();

  // Initialize form values when document changes or dialog opens
  useState(() => {
    if (document) {
      setTitle(document.title || "");
      setDescription(document.description || "");
      setIsSearchable(document.is_searchable || false);
      setTags(
        document.tags && Array.isArray(document.tags)
          ? document.tags.join(", ")
          : ""
      );
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      updateDocument(data.id, data.payload),
    onSuccess: () => {
      // Invalidate and refetch the binder query to update the UI
      queryClient.invalidateQueries({ queryKey: ["binder"] });
      onOpenChange(false);
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error updating document:", error);
      setIsUpdating(false);
    },
  });

  const handleUpdate = () => {
    if (!document?.id) return;

    setIsUpdating(true);

    // Convert comma-separated tags to array
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    updateDocumentMutation.mutate({
      id: document.id,
      payload: {
        title,
        description: description || null,
        tags: tagsArray,
        is_searchable: isSearchable,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le document</DialogTitle>
          <DialogDescription>
            Modifiez les informations du document ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du document"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du document"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="searchable"
              checked={isSearchable}
              onCheckedChange={setIsSearchable}
            />
            <Label htmlFor="searchable">Document recherchable</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || !title.trim()}
          >
            {isUpdating ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
