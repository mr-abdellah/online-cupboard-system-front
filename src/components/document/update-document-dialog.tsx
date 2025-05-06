"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { updateDocument } from "@/services/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const queryClient = useQueryClient();

  // Initialize form values when document changes or dialog opens
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setDescription(document.description || "");
      setIsSearchable(document.is_searchable || false);
      setTags(Array.isArray(document.tags) ? [...document.tags] : []);
      setTagInput("");
    }
  }, [document, open]);

  const updateDocumentMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      updateDocument(data.id, data.payload),
    onSuccess: () => {
      // Invalidate and refetch the binder query to update the UI
      queryClient.invalidateQueries({ queryKey: ["binder"] });
      queryClient.invalidateQueries({ queryKey: ["document", document?.id] });
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

    updateDocumentMutation.mutate({
      id: document.id,
      payload: {
        title,
        description: description || null,
        tags: tags,
        is_searchable: isSearchable,
      },
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();

      // Check if tag already exists
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }

      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
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
            {title.trim() === "" && (
              <p className="text-sm text-red-500">Le titre est requis</p>
            )}
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
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Ajoutez des tags et appuyez sur Entrée"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-1 rounded-full hover:bg-blue-200/50 p-0.5"
                    >
                      <XIcon size={14} />
                      <span className="sr-only">Supprimer le tag {tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="searchable">Document recherchable</Label>
              <p className="text-sm text-gray-500">
                Permet de retrouver ce document via la recherche
              </p>
            </div>
            <Switch
              id="searchable"
              checked={isSearchable}
              onCheckedChange={setIsSearchable}
            />
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
