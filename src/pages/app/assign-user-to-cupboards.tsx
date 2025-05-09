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
} from "react-icons/fi";

import { getCupboards, type CupboardResponse } from "@/services/cupboard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  assignManagePermissionToUserForCupboards,
  getCupboardWithUserPermissions,
  UserPermission,
} from "@/services/cupboard-pemissions";

export default function AssignUserToCupboards() {
  const { user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCupboards, setSelectedCupboards] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserPermission | null>(null);
  const [filteredCupboards, setFilteredCupboards] = useState<
    CupboardResponse[]
  >([]);

  // Récupérer toutes les armoires
  const {
    data: cupboards,
    isLoading: isLoadingCupboards,
    error: cupboardsError,
  } = useQuery({
    queryKey: ["cupboards"],
    queryFn: () => getCupboards(),
    retry: 1,
    refetchOnMount: false,
  });

  // Vérifier les permissions de l'utilisateur pour chaque armoire
  const checkUserPermissions = async (cupboardId: string) => {
    try {
      const response = await getCupboardWithUserPermissions(
        cupboardId,
        String(user_id)
      );
      if (response.user && response.user.permissions.includes("manage")) {
        // Si c'est la première vérification, enregistrer les infos de l'utilisateur
        if (!userInfo && response.user) {
          setUserInfo(response.user);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `Erreur lors de la vérification des permissions pour l'armoire ${cupboardId}:`,
        error
      );
      return false;
    }
  };

  // Vérifier les permissions initiales
  useEffect(() => {
    const checkAllPermissions = async () => {
      if (cupboards && cupboards.length > 0) {
        const permissionChecks = await Promise.all(
          cupboards.map(async (cupboard) => {
            const hasPermission = await checkUserPermissions(cupboard.id);
            return hasPermission ? cupboard.id : null;
          })
        );

        // Filtrer les valeurs null
        const selectedIds = permissionChecks.filter(
          (id) => id !== null
        ) as string[];
        setSelectedCupboards(selectedIds);
      }
    };

    checkAllPermissions();
  }, [cupboards, user_id]);

  // Filtrer les armoires en fonction de la recherche
  useEffect(() => {
    if (cupboards) {
      const filtered = cupboards.filter((cupboard) =>
        cupboard.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCupboards(filtered);
    }
  }, [searchQuery, cupboards]);

  // Mutation pour sauvegarder les permissions
  const savePermissionsMutation = useMutation({
    mutationFn: () =>
      assignManagePermissionToUserForCupboards(
        String(user_id),
        selectedCupboards
      ),
    onSuccess: () => {
      toast.success("Permissions mises à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["cupboards"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour des permissions");
      console.error("Erreur:", error);
    },
  });

  // Gérer la sélection/désélection d'une armoire
  const handleCupboardSelection = (cupboardId: string, checked: boolean) => {
    if (checked) {
      setSelectedCupboards((prev) => [...prev, cupboardId]);
    } else {
      setSelectedCupboards((prev) => prev.filter((id) => id !== cupboardId));
    }
  };

  // Sélectionner/désélectionner toutes les armoires
  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredCupboards) {
      setSelectedCupboards(filteredCupboards.map((cupboard) => cupboard.id));
    } else {
      setSelectedCupboards([]);
    }
  };

  // Sauvegarder les modifications
  const handleSavePermissions = () => {
    savePermissionsMutation.mutate();
  };

  // Vérifier si toutes les armoires filtrées sont sélectionnées
  const areAllSelected =
    filteredCupboards?.length > 0 &&
    filteredCupboards.every((cupboard) =>
      selectedCupboards.includes(cupboard.id)
    );

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
            Gestion des permissions utilisateur
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

      {userInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations utilisateur</CardTitle>
            <CardDescription>
              Gérez les permissions d'accès aux armoires pour cet utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar || "/placeholder.svg"}
                    alt={userInfo.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  userInfo.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium">{userInfo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {userInfo.email}
                </p>
                <div className="flex gap-2 mt-1">
                  {userInfo.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Armoires documentaires</CardTitle>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une armoire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <CardDescription>
            Sélectionnez les armoires auxquelles l'utilisateur aura accès avec
            des permissions de gestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCupboards ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin mr-2" size={20} />
              <span>Chargement des armoires...</span>
            </div>
          ) : cupboardsError ? (
            <div className="flex justify-center items-center py-12 text-destructive">
              <FiAlertCircle className="mr-2" size={20} />
              <span>Erreur lors du chargement des armoires</span>
            </div>
          ) : filteredCupboards && filteredCupboards.length > 0 ? (
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
                  Sélectionner toutes les armoires
                </label>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <span className="text-sm text-muted-foreground">
                  {selectedCupboards.length} armoire(s) sélectionnée(s)
                </span>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nom de l'armoire</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Classeurs</TableHead>
                      <TableHead className="w-24 text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCupboards.map((cupboard) => {
                      const isSelected = selectedCupboards.includes(
                        cupboard.id
                      );
                      return (
                        <TableRow key={cupboard.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleCupboardSelection(
                                  cupboard.id,
                                  checked === true
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {cupboard.name}
                          </TableCell>
                          <TableCell>
                            {new Date(cupboard.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </TableCell>
                          <TableCell>
                            {cupboard.binders ? cupboard.binders.length : 0}{" "}
                            classeur(s)
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
                  <p>Aucune armoire ne correspond à votre recherche</p>
                  <p className="text-sm mt-1">Essayez avec un autre terme</p>
                </>
              ) : (
                <>
                  <p>Aucune armoire disponible</p>
                  <p className="text-sm mt-1">
                    Créez des armoires pour pouvoir attribuer des permissions
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
