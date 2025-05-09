"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/services/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiUser, FiLock, FiUpload } from "react-icons/fi";
import { toast } from "sonner";

// Schéma de validation pour les informations personnelles
const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
});

// Schéma de validation pour le mot de passe
const passwordSchema = z
  .object({
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères",
    }),
    password_confirmation: z
      .string()
      .min(1, { message: "Veuillez confirmer votre mot de passe" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  });

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Formulaire pour les informations personnelles
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Formulaire pour le mot de passe
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
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

  // Soumettre les informations personnelles
  const onPersonalInfoSubmit = async (data: PersonalInfoValues) => {
    setIsUpdating(true);

    try {
      const formData: { name?: string; avatar?: File } = { name: data.name };

      // Ajouter l'avatar s'il a été modifié
      if (avatarFile) {
        formData.avatar = avatarFile;
      }

      await updateProfile(formData);

      toast.success(
        "Vos informations personnelles ont été mises à jour avec succès."
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsUpdating(false);
    }
  };

  // Soumettre le nouveau mot de passe
  const onPasswordSubmit = async (data: PasswordValues) => {
    setIsUpdating(true);

    try {
      await updateProfile({
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      // Réinitialiser le formulaire après la mise à jour
      passwordForm.reset({
        password: "",
        password_confirmation: "",
      });

      toast.success("Votre mot de passe a été mis à jour avec succès.");
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de la mise à jour de votre mot de passe."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-md">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
            <CardDescription className="text-gray-500">
              Gérez vos informations personnelles et votre sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="mb-6 w-full grid grid-cols-2">
                <TabsTrigger
                  value="personal-info"
                  className="flex items-center justify-center"
                >
                  <FiUser className="mr-2" size={16} />
                  Informations personnelles
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center justify-center"
                >
                  <FiLock className="mr-2" size={16} />
                  Sécurité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal-info">
                <Form {...personalInfoForm}>
                  <form
                    onSubmit={personalInfoForm.handleSubmit(
                      onPersonalInfoSubmit
                    )}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex flex-col items-center space-y-3">
                        <Avatar className="w-24 h-24 border border-gray-200">
                          <AvatarImage
                            src={avatarPreview || user?.avatar || ""}
                            alt="Photo de profil"
                          />
                          <AvatarFallback className="text-xl">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center">
                          <label
                            htmlFor="avatar-upload"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <FiUpload className="mr-1" size={14} />
                            Changer la photo
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 w-full">
                        <FormField
                          control={personalInfoForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input value={user?.email || ""} disabled />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Votre email ne peut pas être modifié.
                          </FormDescription>
                        </FormItem>

                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full md:w-auto"
                          >
                            {isUpdating
                              ? "Enregistrement..."
                              : "Enregistrer les modifications"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="security">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-1">Sécurité</h3>
                  <p className="text-sm text-gray-500">
                    Mettez à jour votre mot de passe pour sécuriser votre compte
                  </p>
                </div>

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
                          <FormLabel>
                            Confirmer le nouveau mot de passe
                          </FormLabel>
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

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full md:w-auto"
                      >
                        {isUpdating
                          ? "Mise à jour..."
                          : "Mettre à jour le mot de passe"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
