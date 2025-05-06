"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/services/user";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/services/user";

// Schéma de validation pour la mise à jour des informations
const updateInfoSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Format d'email invalide" }),
  status: z.enum(["active", "inactive"], {
    required_error: "Veuillez sélectionner un statut",
  }),
});

// Schéma de validation pour la mise à jour du mot de passe
const updatePasswordSchema = z
  .object({
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
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  });

type UpdateInfoValues = z.infer<typeof updateInfoSchema>;
type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

interface UpdateUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export function UpdateUserDialog({
  open,
  setOpen,
  user,
}: UpdateUserDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  // Formulaire pour la mise à jour des informations
  const infoForm = useForm<UpdateInfoValues>({
    resolver: zodResolver(updateInfoSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      status: (user.status as "active" | "inactive") || "active",
    },
  });

  // Formulaire pour la mise à jour du mot de passe
  const passwordForm = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  // Réinitialiser les formulaires lorsque l'utilisateur change
  useEffect(() => {
    // Réinitialiser le formulaire d'informations avec les données du nouvel utilisateur
    infoForm.reset({
      name: user.name,
      email: user.email,
      status: (user.status as "active" | "inactive") || "active",
    });

    // Réinitialiser le formulaire de mot de passe
    passwordForm.reset({
      password: "",
      password_confirmation: "",
    });

    // Réinitialiser l'avatar
    setAvatarFile(null);
    setAvatarPreview(null);

    // Réinitialiser l'onglet actif
    setActiveTab("info");
  }, [user, infoForm, passwordForm]);

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getUserInitials = () => {
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

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

  // Soumettre le formulaire d'informations
  const onInfoSubmit = async (data: UpdateInfoValues) => {
    setIsSubmitting(true);

    try {
      // Ajouter l'avatar s'il a été modifié
      const userData = {
        ...data,
        avatar: avatarFile || undefined,
      };

      await updateUser(user.id, userData);

      // Rafraîchir la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success(
        "Les informations de l'utilisateur ont été mises à jour avec succès"
      );

      // Fermer le dialogue
      setOpen(false);
    } catch (error) {
      toast.error(
        "Erreur lors de la mise à jour des informations de l'utilisateur"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumettre le formulaire de mot de passe
  const onPasswordSubmit = async (data: UpdatePasswordValues) => {
    setIsSubmitting(true);

    try {
      await updateUser(user.id, {
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      // Rafraîchir la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("Le mot de passe a été mis à jour avec succès");

      // Réinitialiser le formulaire
      passwordForm.reset({
        password: "",
        password_confirmation: "",
      });

      // Fermer le dialogue
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer le dialogue
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur {user.name}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="password">Mot de passe</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <Form {...infoForm}>
              <form
                onSubmit={infoForm.handleSubmit(onInfoSubmit)}
                className="space-y-4"
              >
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="w-24 h-24 border border-gray-200 mb-2">
                    <AvatarImage
                      src={avatarPreview || user.avatar || ""}
                      alt="Avatar"
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="update-avatar-upload"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <FiUpload className="mr-1" size={14} />
                    Changer l'avatar
                  </label>
                  <input
                    id="update-avatar-upload"
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
                  control={infoForm.control}
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
                  control={infoForm.control}
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

                <FormField
                  control={infoForm.control}
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

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Au moins 8 caractères, incluant une majuscule, une
                        minuscule et un chiffre.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
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

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Mise à jour..."
                      : "Mettre à jour le mot de passe"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
