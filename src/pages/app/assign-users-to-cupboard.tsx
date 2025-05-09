"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiSave,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiFolder,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  assignManagePermissionToUsersForCupboard,
  CupboardWithPermissionsResponse,
  getCupboardWithUsersAndPermissions,
} from "@/services/cupboard-pemissions";
import { getAllUsers } from "@/services/user";

export default function CupboardPermissionsPage() {
  const { cupboard_id } = useParams<{ cupboard_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Récupérer l'armoire avec ses utilisateurs et leurs permissions
  const {
    data: cupboardData,
    isLoading: isLoadingCupboard,
    error: cupboardError,
  } = useQuery<CupboardWithPermissionsResponse>({
    queryKey: ["cupboard-permissions", cupboard_id],
    queryFn: () => getCupboardWithUsersAndPermissions(cupboard_id || ""),
    enabled: !!cupboard_id,
  });

  // Récupérer tous les utilisateurs avec pagination
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["all-users", currentPage, perPage, searchQuery],
    queryFn: () => getAllUsers(currentPage, perPage, searchQuery),
  });

  // Initialiser les utilisateurs sélectionnés (ceux qui ont déjà la permission "manage")
  useEffect(() => {
    if (cupboardData?.users) {
      const usersWithManagePermission = cupboardData.users
        .filter((user) => user.permissions.includes("manage"))
        .map((user) => user.id);

      setSelectedUsers(usersWithManagePermission);
    }
  }, [cupboardData]);

  // Mutation pour sauvegarder les permissions
  const savePermissionsMutation = useMutation({
    mutationFn: () =>
      assignManagePermissionToUsersForCupboard(
        cupboard_id || "",
        selectedUsers
      ),
    onSuccess: () => {
      toast.success("Permissions mises à jour avec succès");
      queryClient.invalidateQueries({
        queryKey: ["cupboard-permissions", cupboard_id],
      });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour des permissions");
      console.error("Erreur:", error);
    },
  });

  // Gérer la sélection/désélection d'un utilisateur
  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Sélectionner/désélectionner tous les utilisateurs de la page actuelle
  const handleSelectAll = (checked: boolean) => {
    if (checked && usersData?.data) {
      const currentPageUserIds = usersData.data.map((user) => user.id);
      setSelectedUsers((prev) => {
        const otherPageUsers = prev.filter(
          (id) => !currentPageUserIds.includes(id)
        );
        return [...otherPageUsers, ...currentPageUserIds];
      });
    } else if (usersData?.data) {
      const currentPageUserIds = usersData.data.map((user) => user.id);
      setSelectedUsers((prev) =>
        prev.filter((id) => !currentPageUserIds.includes(id))
      );
    }
  };

  // Sauvegarder les modifications
  const handleSavePermissions = () => {
    savePermissionsMutation.mutate();
  };

  // Vérifier si tous les utilisateurs de la page actuelle sont sélectionnés
  const areAllSelected =
    usersData?.data &&
    usersData.data.length > 0 &&
    usersData.data.every((user) => selectedUsers.includes(user.id));

  // Obtenir les initiales d'un nom pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Vérifier si un utilisateur a déjà des permissions sur l'armoire
  const getUserPermissions = (userId: string): string[] => {
    if (!cupboardData?.users) return [];
    const user = cupboardData.users.find((u) => u.id === userId);
    return user ? user.permissions : [];
  };

  // Générer les liens de pagination
  const generatePaginationLinks = () => {
    if (!usersData) return [];

    const { current_page, last_page } = usersData;
    const links = [];

    // Première page
    if (current_page > 2) {
      links.push({ page: 1, label: "1" });
    }

    // Points de suspension au début
    if (current_page > 3) {
      links.push({ page: null, label: "..." });
    }

    // Page précédente
    if (current_page > 1) {
      links.push({
        page: current_page - 1,
        label: (current_page - 1).toString(),
      });
    }

    // Page actuelle
    links.push({
      page: current_page,
      label: current_page.toString(),
      active: true,
    });

    // Page suivante
    if (current_page < last_page) {
      links.push({
        page: current_page + 1,
        label: (current_page + 1).toString(),
      });
    }

    // Points de suspension à la fin
    if (current_page < last_page - 2) {
      links.push({ page: null, label: "..." });
    }

    // Dernière page
    if (current_page < last_page - 1 && last_page > 1) {
      links.push({ page: last_page, label: last_page.toString() });
    }

    return links;
  };

  const isLoading = isLoadingCupboard || isLoadingUsers;
  const error = cupboardError || usersError;

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <FiArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Gestion des permissions d'armoire
          </h1>
        </div>
        <Button
          onClick={handleSavePermissions}
          disabled={savePermissionsMutation.isPending}
          className="flex items-center gap-2"
        >
          {savePermissionsMutation.isPending ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiSave />
          )}
          Enregistrer les modifications
        </Button>
      </div>

      {cupboardData?.cupboard && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de l'armoire</CardTitle>
            <CardDescription>
              Gérez les permissions des utilisateurs pour cette armoire
              documentaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FiFolder size={32} />
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  {cupboardData.cupboard.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Créée le{" "}
                  {new Date(
                    cupboardData.cupboard.created_at
                  ).toLocaleDateString("fr-FR")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FiUsers size={14} />
                    {cupboardData.users.length} utilisateur(s) avec accès
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Utilisateurs</CardTitle>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <CardDescription>
            Sélectionnez les utilisateurs qui auront accès à cette armoire avec
            des permissions de gestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin mr-2" size={20} />
              <span>Chargement des utilisateurs...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12 text-destructive">
              <FiAlertCircle className="mr-2" size={20} />
              <span>Erreur lors du chargement des données</span>
            </div>
          ) : usersData?.data && usersData.data.length > 0 ? (
            <>
              <div className="flex items-center mb-4 gap-2">
                <Checkbox
                  id="select-all"
                  checked={areAllSelected}
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked === true)
                  }
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Sélectionner tous les utilisateurs de cette page
                </label>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} utilisateur(s) sélectionné(s) au total
                </span>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Permissions actuelles</TableHead>
                      <TableHead className="w-24 text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.data.map((user) => {
                      const isSelected = selectedUsers.includes(user.id);
                      const currentPermissions = getUserPermissions(user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleUserSelection(user.id, checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar>
                                {user.avatar ? (
                                  <AvatarImage
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.name}
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {currentPermissions.length > 0 ? (
                                currentPermissions.map((permission) => (
                                  <Badge
                                    key={permission}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {permission}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  Aucune permission
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isSelected ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1 ml-auto w-fit">
                                <FiCheck size={14} />
                                Accès
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground ml-auto w-fit"
                              >
                                Aucun accès
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <>
                  <p>Aucun utilisateur ne correspond à votre recherche</p>
                  <p className="text-sm mt-1">Essayez avec un autre terme</p>
                </>
              ) : (
                <>
                  <p>Aucun utilisateur disponible</p>
                  <p className="text-sm mt-1">
                    Ajoutez des utilisateurs pour pouvoir attribuer des
                    permissions
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
        {usersData && usersData.last_page > 1 && (
          <CardFooter className="flex justify-center">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <FiChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Page précédente</span>
                    </PaginationLink>
                  </PaginationItem>
                )}

                {generatePaginationLinks().map((link, i) =>
                  link.page === null ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${link.page}`}>
                      <PaginationLink
                        isActive={link.active}
                        onClick={() => link.page && setCurrentPage(link.page)}
                      >
                        {link.label}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                {currentPage < (usersData?.last_page || 1) && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <FiChevronRight className="h-4 w-4" />
                      <span className="sr-only">Page suivante</span>
                    </PaginationLink>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
