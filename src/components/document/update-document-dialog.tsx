"use client";

import type React from "react";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDocument, updateDocument } from "@/services/document";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().optional(),
  tags: z.array(z.string()),
  tagInput: z.string().optional(),
});

interface UpdateDocumentDialogProps {
  document: { id: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateDocumentDialog({
  document,
  open,
  onOpenChange,
}: UpdateDocumentDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      tagInput: "",
    },
  });

  const { data: fetchedDoc } = useQuery({
    queryKey: ["document", document?.id],
    queryFn: () => getDocument(document!.id),
    enabled: !!document?.id && open,
  });

  useEffect(() => {
    if (fetchedDoc) {
      form.reset({
        title: fetchedDoc.title,
        description: fetchedDoc.description ?? "",
        tags: fetchedDoc.tags ?? [],
        tagInput: "",
      });
    }
  }, [fetchedDoc, form]);

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      updateDocument(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["binder"] });
      queryClient.invalidateQueries({ queryKey: ["document", document?.id] });
      onOpenChange(false);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!document?.id) return;
    updateMutation.mutate({ id: document.id, payload: values });
  };

  const handleAddTag = (
    e: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    tags: string[]
  ) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      if (!tags.includes(value.trim())) {
        form.setValue("tags", [...tags, value.trim()]);
        form.setValue("tagInput", "");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string, tags: string[]) => {
    form.setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du document"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot-clés</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        value={form.watch("tagInput") || ""}
                        onChange={(e) =>
                          form.setValue("tagInput", e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleAddTag(
                            e,
                            form.watch("tagInput") || "",
                            field.value
                          )
                        }
                        placeholder="Ajoutez des tags et appuyez sur Entrée"
                      />
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveTag(tag, field.value)
                                }
                                className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-1 rounded-full hover:bg-blue-200/50 p-0.5"
                              >
                                <XIcon size={14} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
