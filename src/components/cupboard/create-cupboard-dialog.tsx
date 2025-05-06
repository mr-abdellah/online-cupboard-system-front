"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createCupboard } from "@/services/cupboard";
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
  name: z.string().min(1, "Le nom de l'armoire est requis"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCupboardDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCupboardDialog({
  open,
  setOpen,
  onSuccess,
}: CreateCupboardDialogProps) {
  const queryClient = useQueryClient();

  // Initialize React Hook Form with Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormValues) => {
    try {
      await createCupboard({ name: values.name });
      await queryClient.invalidateQueries({ queryKey: ["cupboards"] });
      form.reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      form.setError("name", {
        type: "manual",
        message: "Erreur lors de la création de l'armoire",
      });
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle armoire</DialogTitle>
          <DialogDescription>
            Entrez le nom de la nouvelle armoire documentaire.
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
                          placeholder="Nom de l'armoire"
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
                {isLoading ? "Création en cours..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
