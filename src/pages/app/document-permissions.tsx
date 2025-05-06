"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiSearch,
  FiLoader,
  FiFile,
  FiUser,
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

export default function DocumentPermissionsPage() {
  const { document_id } = useParams<{ document_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // États pour la recherche et la pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // État pour stocker les utilisateurs avec leurs permissions modifiées
  const [modifiedUsers, setModifiedUsers] = useState<Map<string, string[]>>(
    new Map()
  );

  // Effet pour débouncer la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Récupérer la liste de tous les utilisateurs
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", debouncedSearchQuery, currentPage, pageSize],
    queryFn: () => getAllUsers(currentPage, pageSize, debouncedSearchQuery),
    enabled: !!document_id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Mutation pour mettre à jour les permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: () => {
      const users: UserPermission[] = [];
      modifiedUsers.forEach((permissions, userId) => {
        users.push({
          user_id: userId,
          permissions,
        });
      });
      return updateDocumentPermissions(document_id || "", users);
    },
    onSuccess: () => {
      toast.success("Permissions mises à jour avec succès");
      queryClient.invalidateQueries({
        queryKey: ["document-permissions", document_id],
      });
      setModifiedUsers(new Map()); // Réinitialiser les modifications après la sauvegarde
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour des permissions");
    },
  });

  // Vérifier si un utilisateur a une permission spécifique
  const hasPermission = (userId: string, permissionType: string): boolean => {
    // Vérifier d'abord dans les modifications
    if (modifiedUsers.has(userId)) {
      return modifiedUsers.get(userId)?.includes(permissionType) || false;
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
    setModifiedUsers((prev) => {
      const newMap = new Map(prev);

      // Obtenir les permissions actuelles de l'utilisateur
      const user = documentData?.users.find((u) => u.id === userId);
      let currentPermissions = user?.permissions || [];

      // Si l'utilisateur a déjà des modifications, utiliser celles-ci
      if (newMap.has(userId)) {
        currentPermissions = newMap.get(userId) || [];
      }

      // Mettre à jour les permissions
      let updatedPermissions: string[];
      if (checked) {
        updatedPermissions = [...currentPermissions, permissionType];
      } else {
        updatedPermissions = currentPermissions.filter(
          (p) => p !== permissionType
        );
      }

      // Enregistrer les modifications
      newMap.set(userId, updatedPermissions);
      return newMap;
    });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    if (modifiedUsers.size > 0) {
      updatePermissionsMutation.mutate();
    } else {
      toast.info("Aucune modification à enregistrer");
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Gérer le changement du nombre d'éléments par page
  const handlePageSizeChange = (value: string) => {
    const newSize = Number.parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de taille
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
        <Button variant="outline" onClick={() => navigate(-1)}>
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
        <Button variant="outline" onClick={() => navigate(-1)}>
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <FiArrowLeft className="mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-medium text-gray-800">
            Permissions du Document
          </h1>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            updatePermissionsMutation.isPending || modifiedUsers.size === 0
          }
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
                  <FiUser className="mr-2" />
                  <span>Propriétaire: Admin</span>
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
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
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
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={usersData.current_page === usersData.last_page}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
