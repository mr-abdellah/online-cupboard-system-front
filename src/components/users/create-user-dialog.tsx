"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiUpload } from "react-icons/fi";
import { createUser, Permission } from "@/services/user";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const permissionLabels: { label: string; value: Permission }[] = [
  { label: "Voir les armoires/classeurs", value: "can_view_documents" },
  {
    label: "Créer ou modifier des armoires/classeurs",
    value: "can_edit_documents",
  },
  { label: "Supprimer des armoires/classeurs", value: "can_delete_document" },
  { label: "Importer des documents", value: "can_upload_documents" },
  { label: "Voir les utilisateurs", value: "can_view_users" },
  { label: "Éditer les utilisateurs", value: "can_edit_users" },
  { label: "Supprimer les utilisateurs", value: "can_delete_users" },
  { label: "Créer des utilisateurs", value: "can_create_users" },
];

// Schéma de validation pour la création d'utilisateur
const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
      .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
    email: z
      .string()
      .min(1, { message: "L'email est requis" })
      .email({ message: "Format d'email invalide" }),
    password: z
      .string()
      .min(8, {
        message: "Le mot de passe doit contenir au moins 8 caractères",
      })
      .regex(/[A-Z]/, {
        message: "Le mot de passe doit contenir au moins une majuscule",
      })
      .regex(/[a-z]/, {
        message: "Le mot de passe doit contenir au moins une minuscule",
      })
      .regex(/[0-9]/, {
        message: "Le mot de passe doit contenir au moins un chiffre",
      }),
    password_confirmation: z
      .string()
      .min(1, { message: "Veuillez confirmer le mot de passe" }),
    status: z.enum(["active", "inactive"], {
      required_error: "Veuillez sélectionner un statut",
    }),
    permissions: z.array(z.string() as z.ZodType<Permission>),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  });

type CreateUserValues = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateUserDialog({ open, setOpen }: CreateUserDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Formulaire pour la création d'utilisateur
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      status: "active",
      permissions: [],
    },
  });

  // Gérer le changement d'avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (data: CreateUserValues) => {
    setIsSubmitting(true);

    try {
      // Ajouter l'avatar s'il a été sélectionné
      const userData = {
        ...data,
        avatar: avatarFile || undefined,
      };

      await createUser(userData);

      // Rafraîchir la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("L'utilisateur a été créé avec succès");

      // Fermer le dialogue et réinitialiser le formulaire
      setOpen(false);
      form.reset();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer le dialogue et réinitialiser le formulaire
  const handleClose = () => {
    setOpen(false);
    form.reset();
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer un nouvel
            utilisateur.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <Avatar className="w-24 h-24 border border-gray-200 mb-2">
                <AvatarImage src={avatarPreview || ""} alt="Avatar" />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <label
                htmlFor="create-avatar-upload"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <FiUpload className="mr-1" size={14} />
                Choisir un avatar
              </label>
              <input
                id="create-avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <FormDescription className="text-xs text-center mt-1">
                JPG, PNG ou GIF. 1MB maximum.
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'utilisateur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemple.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <div>
              <h3 className="text-sm font-medium mb-3">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissionLabels.map((permission) => (
                  <FormField
                    key={permission.value}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.value)}
                              onCheckedChange={(checked) => {
                                const updatedPermissions = checked
                                  ? [...field.value, permission.value]
                                  : field.value?.filter(
                                      (value) => value !== permission.value
                                    );
                                field.onChange(updatedPermissions);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {permission.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création en cours..." : "Créer l'utilisateur"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
