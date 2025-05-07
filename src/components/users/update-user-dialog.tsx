"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { updateUser, getUser } from "@/services/user";
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
import type { Permission } from "@/services/user";
import { Checkbox } from "@/components/ui/checkbox";

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

// Unified schema for all user data
const updateUserSchema = z
  .object({
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
    password: z
      .string()
      .min(8, {
        message: "Le mot de passe doit contenir au moins 8 caractères",
      })
      .optional()
      .or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
    permissions: z.array(z.string() as z.ZodType<Permission>),
    avatar: z.any().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, password_confirmation must match
      if (data.password && data.password.length > 0) {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["password_confirmation"],
    }
  );

type UpdateUserValues = z.infer<typeof updateUserSchema>;

interface UpdateUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
}

export function UpdateUserDialog({
  open,
  setOpen,
  userId,
}: UpdateUserDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("info");

  // Fetch user data with useQuery
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: open && !!userId,
  });

  // Create form with react-hook-form
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      status: (userData?.status as "active" | "inactive") || "active",
      password: "",
      password_confirmation: "",
      permissions: userData?.permissions?.map((p) => p.name) || [],
      avatar: undefined,
    },
  });

  // Update form values when user data is loaded
  React.useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name,
        email: userData.email,
        status: (userData.status as "active" | "inactive") || "active",
        password: "",
        password_confirmation: "",
        permissions: userData?.permissions?.map((p) => p.name) || [],
        avatar: undefined,
      });
    }
  }, [userData, form]);

  // Handle avatar change
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userData) return "";
    return userData.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Create mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserValues) => {
      // Only include password fields if password is provided
      const updateData = {
        ...data,
        password:
          data.password && data.password.length > 0 ? data.password : undefined,
        password_confirmation:
          data.password && data.password.length > 0
            ? data.password_confirmation
            : undefined,
      };
      return updateUser(userId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success(
        "Les informations de l'utilisateur ont été mises à jour avec succès"
      );
      setOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    },
  });

  // Submit handler
  const onSubmit = (data: UpdateUserValues) => {
    updateUserMutation.mutate(data);
  };

  // Close dialog handler
  const handleClose = () => {
    setOpen(false);
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center p-6">
            <p>Chargement...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur {userData?.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="password">Mot de passe</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 space-y-4">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="w-24 h-24 border border-gray-200 mb-2">
                    <AvatarImage
                      src={
                        form.watch("avatar")
                          ? URL.createObjectURL(form.watch("avatar") as File)
                          : userData?.avatar || ""
                      }
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
                          <SelectTrigger className="w-full">
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
              </TabsContent>

              <TabsContent value="password" className="mt-4 space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
              </TabsContent>

              <TabsContent value="permissions" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Controller
                        control={form.control}
                        name="permissions"
                        render={({ field }) => (
                          <>
                            {permissionLabels.map((permission) => (
                              <div
                                key={permission.value}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={permission.value}
                                  checked={field.value.includes(
                                    permission.value
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...field.value,
                                        permission.value,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (p) => p !== permission.value
                                        )
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={permission.value}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permission.label}
                                </label>
                              </div>
                            ))}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending
                  ? "Mise à jour..."
                  : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
