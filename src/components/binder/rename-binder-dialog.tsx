"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateBinder, type BinderResponse } from "@/services/binder";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Le nom du classeur est requis"),
});

type FormValues = z.infer<typeof formSchema>;

interface RenameBinderDialogProps {
  binder: BinderResponse;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RenameBinderDialog({
  binder,
  open,
  setOpen,
  onSuccess,
}: RenameBinderDialogProps) {
  const queryClient = useQueryClient();

  // Initialize React Hook Form with Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: binder.name,
    },
  });

  // Update form values when binder changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ name: binder.name });
    }
  }, [binder, open, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormValues) => {
    // Skip update if name hasn't changed
    if (values.name.trim() === binder.name) {
      setOpen(false);
      return;
    }

    try {
      await updateBinder(binder.id, {
        name: values.name,
        cupboard_id: binder.cupboard_id,
      });
      await queryClient.invalidateQueries({ queryKey: ["cupboards"] });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      form.setError("root", {
        type: "manual",
        message: "Erreur lors de la mise à jour du classeur",
      });
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Renommer le classeur</DialogTitle>
          <DialogDescription>
            Modifiez le nom du classeur documentaire.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Nom du classeur"
                          disabled={isLoading}
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {form.formState.errors.root && (
                <div className="text-sm text-red-500 col-span-4 text-center">
                  {form.formState.errors.root.message}
                </div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Mise à jour..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
