"use client";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiSearch,
  FiLoader,
  FiFile,
  FiCalendar,
  FiTag,
  FiSave,
} from "react-icons/fi";
import {
  getDocumentWithUsersAndPermissions,
  updateDocumentPermissions,
  type UserPermission,
} from "@/services/document-permissions";
import { getAllUsers } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Fonction pour obtenir l'icône en fonction du type de fichier
import documentSvg from "@/assets/document.svg";
import pdfPng from "@/assets/pdf.png";
import imagePng from "@/assets/image.png";
import videoPng from "@/assets/video.png";
import wordSvg from "@/assets/word.svg";

const getFileIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "pdf":
      return pdfPng;
    case "doc":
    case "docx":
    case "word":
      return wordSvg;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "image":
      return imagePng;
    case "mp4":
    case "avi":
    case "mov":
    case "video":
      return videoPng;
    default:
      return documentSvg;
  }
};

// Types de permissions disponibles
const PERMISSION_TYPES = ["view", "edit", "delete", "download"];

// Options pour le nombre d'éléments par page
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// Schéma de validation Zod pour le formulaire
const permissionsFormSchema = z.object({
  isPublic: z.boolean(),
  userPermissions: z.record(z.string(), z.array(z.string())),
  searchQuery: z.string().optional().default(""),
  pageSize: z.number().min(1).optional().default(10),
  currentPage: z.number().min(1).optional().default(1),
});

// Update the type definition to match the schema
type PermissionsFormValues = {
  isPublic: boolean;
  userPermissions: Record<string, string[]>;
  searchQuery?: string;
  pageSize?: number;
  currentPage?: number;
};
export default function DocumentPermissionsPage() {
  const { document_id } = useParams<{ document_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initialiser React Hook Form avec Zod
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
    reset,
  } = useForm<PermissionsFormValues>({
    resolver: zodResolver(permissionsFormSchema),
    defaultValues: {
      isPublic: false,
      userPermissions: {},
      searchQuery: "",
      pageSize: 10,
      currentPage: 1,
    },
  });

  // Observer les valeurs du formulaire
  const isPublic = watch("isPublic");
  const searchQuery = watch("searchQuery");
  const currentPage = watch("currentPage");
  const pageSize = watch("pageSize");
  const userPermissions = watch("userPermissions");

  // Récupérer les informations du document avec les utilisateurs et leurs permissions
  const {
    data: documentData,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document-permissions", document_id],
    queryFn: () => getDocumentWithUsersAndPermissions(document_id || ""),
    enabled: !!document_id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Move the onSuccess logic to useEffect
  useEffect(() => {
    if (documentData) {
      // Initialize isPublic with the document value
      setValue("isPublic", documentData.document?.is_public || false);

      // Initialize user permissions
      const initialPermissions: Record<string, string[]> = {};
      documentData.users.forEach((user) => {
        initialPermissions[user.id] = user.permissions;
      });
      setValue("userPermissions", initialPermissions);

      // Reset the "dirty" state after setting initial values
      reset({
        isPublic: documentData.document?.is_public || false,
        userPermissions: initialPermissions,
        searchQuery: "",
        pageSize: 10,
        currentPage: 1,
      });
    }
  }, [documentData, setValue, reset]);

  // Récupérer la liste de tous les utilisateurs
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", searchQuery, currentPage, pageSize],
    queryFn: () => getAllUsers(currentPage, pageSize, searchQuery),
    enabled: !!document_id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Mutation pour mettre à jour les permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: (data: PermissionsFormValues) => {
      const users: UserPermission[] = [];
      Object.entries(data.userPermissions).forEach(([userId, permissions]) => {
        users.push({
          user_id: userId,
          permissions,
        });
      });
      return updateDocumentPermissions(document_id || "", users, data.isPublic);
    },
    onSuccess: () => {
      toast.success("Permissions mises à jour avec succès");
      queryClient.invalidateQueries({
        queryKey: ["document-permissions", document_id],
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour des permissions");
    },
  });

  // Vérifier si un utilisateur a une permission spécifique
  const hasPermission = (userId: string, permissionType: string): boolean => {
    // Vérifier dans les permissions du formulaire
    if (userPermissions[userId]) {
      return userPermissions[userId].includes(permissionType);
    }

    // Sinon vérifier dans les permissions originales
    const user = documentData?.users.find((u) => u.id === userId);
    return user ? user.permissions.includes(permissionType) : false;
  };

  // Gérer le changement de permission
  const handlePermissionChange = (
    userId: string,
    permissionType: string,
    checked: boolean
  ) => {
    const currentPermissions = userPermissions[userId] || [];
    let updatedPermissions: string[];

    if (checked) {
      updatedPermissions = [...currentPermissions, permissionType];
    } else {
      updatedPermissions = currentPermissions.filter(
        (p) => p !== permissionType
      );
    }

    setValue(`userPermissions.${userId}`, updatedPermissions, {
      shouldDirty: true,
    });
  };

  // Gérer la soumission du formulaire
  const onSubmit = handleSubmit((formData) => {
    // Create a properly typed object from the form data
    const submissionData: PermissionsFormValues = {
      isPublic: formData.isPublic,
      userPermissions: formData.userPermissions,
      searchQuery: formData.searchQuery || "",
      pageSize: formData.pageSize || 10,
      currentPage: formData.currentPage || 1,
    };

    updatePermissionsMutation.mutate(submissionData);
  });

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setValue("currentPage", page);
  };

  // Gérer le changement du nombre d'éléments par page
  const handlePageSizeChange = (value: string) => {
    const newSize = Number.parseInt(value, 10);
    setValue("pageSize", newSize);
    setValue("currentPage", 1); // Réinitialiser à la première page lors du changement de taille
  };

  // Afficher un état de chargement
  if (isLoadingDocument) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin h-8 w-8 text-[#3b5de7]" />
      </div>
    );
  }

  // Afficher un message d'erreur
  if (documentError) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
        <div className="text-red-500 mb-2">
          Une erreur est survenue lors du chargement du document.
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Retour
        </Button>
      </div>
    );
  }

  // Obtenir les données du document
  const document = documentData?.document;

  // Afficher un état de chargement pour les utilisateurs
  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin h-8 w-8 text-[#3b5de7]" />
      </div>
    );
  }

  // Afficher un message d'erreur pour les utilisateurs
  if (usersError) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
        <div className="text-red-500 mb-2">
          Une erreur est survenue lors du chargement des utilisateurs.
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Retour
        </Button>
      </div>
    );
  }

  // Obtenir la liste des utilisateurs à afficher
  const displayUsers = usersData?.data || [];

  // Filtrer les utilisateurs si une recherche est active
  const filteredUsers = searchQuery
    ? displayUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayUsers;

  return (
    <form onSubmit={onSubmit} className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col items-start md:flex-row md:items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mr-2"
          >
            <FiArrowLeft className="mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-medium text-gray-800">
            Permissions du Document
          </h1>
        </div>

        <Button
          type="submit"
          disabled={updatePermissionsMutation.isPending || !isDirty}
          className="bg-[#3b5de7] hover:bg-[#2d4ccc]"
        >
          {updatePermissionsMutation.isPending ? (
            <>
              <FiLoader className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>

      {/* Informations du document */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations du Document</CardTitle>
          <CardDescription>
            Détails du document dont vous gérez les permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start">
            <div className="w-16 h-16 mr-4 flex items-center justify-center">
              <img
                src={getFileIcon(document?.type || "")}
                alt={document?.type || "Document"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{document?.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiFile className="mr-2" />
                  <span>Type: {document?.type?.toUpperCase()}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FiCalendar className="mr-2" />
                  <span>
                    Créé le:{" "}
                    {new Date(document?.created_at || "").toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiTag className="mr-2" />
                  <div className="flex flex-wrap gap-1">
                    {document?.tags && document.tags.length > 0 ? (
                      document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">Aucun tag</span>
                    )}
                  </div>
                </div>
              </div>
              {document?.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {document.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option document public */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Visibilité du Document</CardTitle>
          <CardDescription>
            Définir si ce document est accessible publiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <Switch
                  id="public-document"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label
              htmlFor="public-document"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Document public
            </label>
            <div className="text-sm text-gray-500 ml-2">
              {isPublic
                ? "Tout le monde peut accéder à ce document"
                : "Seuls les utilisateurs avec des permissions peuvent accéder à ce document"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs et permissions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestion des Permissions</CardTitle>
              <CardDescription>
                Accordez des permissions aux utilisateurs pour ce document
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Controller
                  name="searchQuery"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Rechercher un utilisateur..."
                      {...field}
                      className="pl-10"
                    />
                  )}
                />
              </div>
              <Controller
                name="pageSize"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field?.value ? field?.value.toString() : "10"}
                    onValueChange={(value) => handlePageSizeChange(value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Utilisateurs par page" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} utilisateurs par page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPublic && (
            <div className="bg-blue-50 p-4 rounded-md mb-4 text-blue-700 border border-blue-100">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Le document est défini comme public. Les permissions
                  individuelles sont désactivées.
                </span>
              </div>
            </div>
          )}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Utilisateur</TableHead>
                  <TableHead className="text-center">Voir</TableHead>
                  <TableHead className="text-center">Éditer</TableHead>
                  <TableHead className="text-center">Supprimer</TableHead>
                  <TableHead className="text-center">Télécharger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchQuery
                        ? "Aucun utilisateur ne correspond à votre recherche"
                        : "Aucun utilisateur disponible"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#3b5de7] text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {PERMISSION_TYPES.map((permission) => (
                        <TableCell key={permission} className="text-center">
                          <Checkbox
                            checked={hasPermission(user.id, permission)}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                user.id,
                                permission,
                                checked as boolean
                              )
                            }
                            disabled={isPublic}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination avec informations sur le nombre d'éléments par page */}
          {usersData && usersData.total > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
              <div className="text-sm text-gray-500">
                Page {usersData.current_page} sur {usersData.last_page} (
                {usersData.total} utilisateurs, {pageSize} par page)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  disabled={usersData.current_page === 1}
                >
                  Précédent
                </Button>
                {Array.from(
                  { length: Math.min(5, usersData.last_page) },
                  (_, i) => {
                    // Afficher au maximum 5 boutons de pagination
                    let pageNumber: number;
                    if (usersData.last_page <= 5) {
                      // Si moins de 5 pages, afficher toutes les pages
                      pageNumber = i + 1;
                    } else {
                      // Sinon, afficher les pages autour de la page courante
                      const middleIndex = Math.min(
                        Math.max(usersData.current_page - 2, 1),
                        usersData.last_page - 4
                      );
                      pageNumber = middleIndex + i;
                    }
                    return (
                      <Button
                        key={pageNumber}
                        type="button"
                        variant={
                          pageNumber === usersData.current_page
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={
                          pageNumber === usersData.current_page
                            ? "bg-[#3b5de7] hover:bg-[#2d4ccc]"
                            : ""
                        }
                      >
                        {pageNumber}
                      </Button>
                    );
                  }
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  disabled={usersData.current_page === usersData.last_page}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
