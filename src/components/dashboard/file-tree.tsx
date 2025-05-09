"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCupboards } from "@/services/cupboard";
import {
  FiChevronRight,
  FiChevronDown,
  FiFolderPlus,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiFolder,
} from "react-icons/fi";

// Import des composants shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import des images pour les icônes
import folderSvg from "@/assets/folder.svg";
import binderPng from "@/assets/binder.png";
import lockSvg from "@/assets/lock.svg";

// Import des dialogs
import { CreateCupboardDialog } from "../cupboard/create-cupboard-dialog";
import { RenameCupboardDialog } from "../cupboard/rename-cupboard-dialog";
import { DeleteCupboardDialog } from "../cupboard/delete-cupboard-dialog";
import { CreateBinderDialog } from "../binder/create-binder-dialog";
import { RenameBinderDialog } from "../binder/rename-binder-dialog";
import { DeleteBinderDialog } from "../binder/delete-binder-dialog";
import { MoveBinderDialog } from "../binder/move-binder-dialog";
import type { CupboardResponse } from "@/services/cupboard";
import type { BinderResponse } from "@/services/binder";
import { usePermission } from "@/hooks/usePermission";
import { Lock, X } from "lucide-react";
import { useNavigate } from "react-router";

interface FileTreeProps {
  selectedItem: { id: string; type: "cupboard" | "binder" } | null;
  onSelect: (id: string, type: "cupboard" | "binder") => void;
}

// Document types for filtering
const documentTypes = [
  { value: "jpg,jpeg", label: "Images JPG" },
  { value: "png", label: "Images PNG" },
  { value: "pdf", label: "Documents PDF" },
  { value: "doc,docx", label: "Documents Word" },
  { value: "xls,xlsx", label: "Feuilles Excel" },
  { value: "ppt,pptx", label: "Présentations PowerPoint" },
];

const FileTree = ({ selectedItem, onSelect }: FileTreeProps) => {
  const [expandedCupboards, setExpandedCupboards] = useState<
    Record<string, boolean>
  >({});
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const parentRef = useRef<HTMLDivElement>(null);
  const hadFilterBefore = useRef(false);
  const navigate = useNavigate();

  const { canEditDocuments, canDeleteDocument, canUploadDocuments } =
    usePermission();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const manuallyCollapsed = useRef<Record<string, boolean>>({});

  // États pour les dialogs
  const [createCupboardOpen, setCreateCupboardOpen] = useState(false);
  const [renameCupboardOpen, setRenameCupboardOpen] = useState(false);
  const [deleteCupboardOpen, setDeleteCupboardOpen] = useState(false);
  const [createBinderOpen, setCreateBinderOpen] = useState(false);
  const [renameBinderOpen, setRenameBinderOpen] = useState(false);
  const [deleteBinderOpen, setDeleteBinderOpen] = useState(false);
  const [moveBinderOpen, setMoveBinderOpen] = useState(false);

  // États pour les éléments sélectionnés pour les opérations
  const [selectedCupboardForAction, setSelectedCupboardForAction] =
    useState<CupboardResponse | null>(null);
  const [selectedBinderForAction, setSelectedBinderForAction] =
    useState<BinderResponse | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Updated useQuery with search and filter parameters
  const { data, isLoading, error } = useQuery({
    queryKey: ["cupboards", debouncedSearchQuery, typeFilter],
    queryFn: () => getCupboards(debouncedSearchQuery, typeFilter),
    staleTime: 5 * 60 * 1000,
  });

  // Memoize sorted cupboards to avoid unnecessary re-sorting
  // Replace the direct sorting with useMemo
  const sortedCupboards = useMemo(() => {
    return data ? [...data].sort((a, b) => a.order - b.order) : [];
  }, [data]);

  // Fonction pour basculer l'état d'expansion d'une armoire
  const toggleCupboard = useCallback((cupboardId: string) => {
    setExpandedCupboards((prev) => {
      const newState = !prev[cupboardId];

      // Track when a user manually collapses a cupboard
      if (!newState) {
        manuallyCollapsed.current[cupboardId] = true;
      } else {
        // If they expand it again, remove from manually collapsed
        delete manuallyCollapsed.current[cupboardId];
      }

      return {
        ...prev,
        [cupboardId]: newState,
      };
    });
  }, []);

  // Handle filter selection
  const handleFilterSelect = useCallback(
    (value: string) => {
      if (typeFilter === value) {
        // If the same filter is clicked again, clear it
        setTypeFilter("");
      } else {
        setTypeFilter(value);
      }
    },
    [typeFilter]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("");
  }, []);

  // Fonctions pour ouvrir les dialogs
  const handleCreateCupboard = useCallback(() => {
    if (!canUploadDocuments) return;
    setCreateCupboardOpen(true);
  }, [canUploadDocuments]);

  const handleRenameCupboard = useCallback(
    (cupboard: CupboardResponse) => {
      if (!canEditDocuments) return;
      setSelectedCupboardForAction(cupboard);
      setRenameCupboardOpen(true);
    },
    [canEditDocuments]
  );

  const handleDeleteCupboard = useCallback(
    (cupboard: CupboardResponse) => {
      if (!canDeleteDocument) return;
      setSelectedCupboardForAction(cupboard);
      setDeleteCupboardOpen(true);
    },
    [canDeleteDocument]
  );

  const handleCreateBinder = useCallback(
    (cupboardId: string) => {
      if (!canUploadDocuments) return;
      setSelectedCupboardForAction(
        data?.find((c) => c.id === cupboardId) || null
      );
      setCreateBinderOpen(true);
    },
    [data, canUploadDocuments]
  );

  const handleRenameBinder = useCallback(
    (binder: BinderResponse) => {
      if (!canEditDocuments) return;
      setSelectedBinderForAction(binder);
      setRenameBinderOpen(true);
    },
    [canEditDocuments]
  );

  const handleDeleteBinder = useCallback(
    (binder: BinderResponse) => {
      if (!canDeleteDocument) return;
      setSelectedBinderForAction(binder);
      setDeleteBinderOpen(true);
    },
    [canDeleteDocument]
  );

  const handleMoveBinder = useCallback(
    (binder: BinderResponse) => {
      if (!canEditDocuments) return;
      setSelectedBinderForAction(binder);
      setMoveBinderOpen(true);
    },
    [canEditDocuments]
  );

  // Effet pour auto-expand lorsqu'un classeur est sélectionné via l'URL
  useEffect(() => {
    if (selectedItem?.type === "binder" && data) {
      // Trouver le cupboard contenant ce binder
      const cupboard = data.find(
        (c) => c.binders && c.binders.some((b) => b.id === selectedItem.id)
      );

      // Only auto-expand if the user hasn't manually collapsed this cupboard
      if (
        cupboard &&
        !expandedCupboards[cupboard.id] &&
        !manuallyCollapsed.current[cupboard.id]
      ) {
        setExpandedCupboards((prev) => ({
          ...prev,
          [cupboard.id]: true,
        }));
      }
    }
  }, [selectedItem, data, expandedCupboards]);

  useEffect(() => {
    // Only expand cupboards when search/filter is initially applied
    const hasFilter = Boolean(debouncedSearchQuery) || Boolean(typeFilter);

    if (hasFilter && !hadFilterBefore.current && sortedCupboards?.length) {
      const newExpanded = { ...expandedCupboards };
      sortedCupboards.forEach((cupboard) => {
        // Only auto-expand if not manually collapsed
        if (!manuallyCollapsed.current[cupboard.id]) {
          newExpanded[cupboard.id] = true;
        }
      });
      setExpandedCupboards(newExpanded);
    }

    hadFilterBefore.current = hasFilter;
    // We intentionally only want this to run when the search/filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, typeFilter]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="ml-4 mt-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
        <div className="flex items-center text-red-600 mb-2">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="font-medium">Erreur de chargement</h3>
        </div>
        <p className="text-sm text-red-500">
          Impossible de charger les données des armoires. Veuillez réessayer.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 h-full flex flex-col"
        ref={parentRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Armoires Documentaires
            {data && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({data.length})
              </span>
            )}
          </h3>
          {canUploadDocuments && (
            <button
              className="text-[#3b5de7] hover:text-[#2d4ccc] p-1 rounded-md hover:bg-blue-50 transition-colors"
              onClick={handleCreateCupboard}
            >
              <FiPlus size={18} />
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <FiFilter size={16} />
                  {typeFilter && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#3b5de7] rounded-full"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  Types de documents
                </div>
                <DropdownMenuSeparator />
                {documentTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={typeFilter === type.value}
                    onCheckedChange={() => handleFilterSelect(type.value)}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearFilters}
                  className="justify-center text-[#3b5de7]"
                >
                  Réinitialiser les filtres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active filters */}
          {(debouncedSearchQuery || typeFilter) && (
            <div className="flex flex-wrap gap-2">
              {debouncedSearchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Recherche: {debouncedSearchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              )}
              {typeFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type:{" "}
                  {documentTypes.find((t) => t.value === typeFilter)?.label ||
                    typeFilter}
                  <button
                    onClick={() => setTypeFilter("")}
                    className="ml-1 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>

        <div
          className="space-y-1 overflow-auto flex-grow"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {sortedCupboards.length > 0 ? (
            <>
              {sortedCupboards.map((cupboard) => {
                // Get all binders for this cupboard
                const allBinders = cupboard.binders || [];

                // Trier les classeurs par ordre
                const sortedBinders = allBinders
                  ? [...allBinders].sort((a, b) => a.order - b.order)
                  : [];

                const isExpanded = expandedCupboards[cupboard.id] || false;
                const isSelected =
                  selectedItem?.id === cupboard.id &&
                  selectedItem?.type === "cupboard";
                const bindersCount = cupboard.binders
                  ? cupboard.binders.length
                  : 0;

                // Vérifier si l'utilisateur peut gérer cette armoire
                const canManageCupboard = cupboard.can_manage !== false;

                return (
                  <div key={cupboard.id} className="select-none">
                    {/* Armoire */}
                    <div
                      className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer ${
                        isSelected
                          ? "bg-[#f0f4ff] text-[#3b5de7]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className="mr-1 text-gray-500 cursor-pointer"
                        onClick={() => {
                          if (!canManageCupboard) return;
                          onSelect(cupboard.id, "cupboard");
                          toggleCupboard(cupboard.id);
                        }}
                      >
                        {isExpanded ? (
                          <FiChevronDown size={16} />
                        ) : (
                          <FiChevronRight size={16} />
                        )}
                      </span>
                      <span
                        className="mr-2 cursor-pointer flex-grow flex items-center"
                        onClick={() => {
                          if (!canManageCupboard) return;
                          toggleCupboard(cupboard.id);
                          onSelect(cupboard.id, "cupboard");
                        }}
                      >
                        <img
                          src={folderSvg || "/placeholder.svg"}
                          alt="Dossier"
                          className={`w-5 h-5 mr-2 ${
                            isSelected ? "opacity-100" : "opacity-70"
                          }`}
                          loading="lazy"
                        />
                        <span className="text-sm font-medium truncate">
                          {cupboard.name}
                        </span>
                      </span>
                      <span className="text-xs text-gray-400 mr-2">
                        {bindersCount}
                      </span>

                      {/* Afficher soit le menu à trois points, soit l'icône de cadenas selon les permissions */}
                      {canManageCupboard ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              ref={(el) => {
                                dropdownRefs.current[
                                  `cupboard-${cupboard.id}`
                                ] = el;
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {canEditDocuments && (
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer"
                                onClick={() => handleRenameCupboard(cupboard)}
                              >
                                <FiEdit className="mr-2" size={14} />
                                <span>Renommer</span>
                              </DropdownMenuItem>
                            )}

                            {canEditDocuments && (
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer"
                                onClick={() => {
                                  navigate(
                                    `/cupboards/${cupboard?.id}/permissions`
                                  );
                                }}
                              >
                                <Lock className="mr-2" size={14} />
                                <span>Permissions</span>
                              </DropdownMenuItem>
                            )}

                            {canDeleteDocument && (
                              <DropdownMenuItem
                                className="flex items-center text-red-500 cursor-pointer"
                                onClick={() => handleDeleteCupboard(cupboard)}
                              >
                                <FiTrash2 className="mr-2" size={14} />
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-1">
                              <img
                                src={lockSvg || "/placeholder.svg"}
                                alt="Verrouillé"
                                className="w-4 h-4 text-gray-400"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Vous n'avez pas la permission de gérer cette
                              armoire
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {/* Classeurs */}
                    {isExpanded && (
                      <div className="ml-6 pl-2 border-l border-gray-200 mt-1 space-y-1">
                        {sortedBinders.map((binder) => {
                          // Ensure binder has all required properties for BinderResponse
                          const completeBinder: BinderResponse = {
                            ...binder,
                            // Add missing properties if they don't exist
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          };

                          const isBinderSelected =
                            selectedItem?.id === binder.id &&
                            selectedItem?.type === "binder";

                          return (
                            <div
                              key={binder.id}
                              className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer ${
                                isBinderSelected
                                  ? "bg-[#f0f4ff] text-[#3b5de7]"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <span
                                className="flex items-center flex-grow cursor-pointer"
                                onClick={() => onSelect(binder.id, "binder")}
                              >
                                <img
                                  src={binderPng || "/placeholder.svg"}
                                  alt="Classeur"
                                  className={`w-5 h-5 mr-2 ${
                                    isBinderSelected
                                      ? "opacity-100"
                                      : "opacity-70"
                                  }`}
                                  loading="lazy"
                                />
                                <span className="text-sm truncate">
                                  {binder.name}
                                </span>
                              </span>

                              {/* Menu à trois points pour le classeur - seulement si l'armoire peut être gérée */}
                              {canManageCupboard ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      ref={(el) => {
                                        dropdownRefs.current[
                                          `binder-${binder.id}`
                                        ] = el;
                                      }}
                                      className="text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                      >
                                        <path
                                          d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                          fill="currentColor"
                                          fillRule="evenodd"
                                          clipRule="evenodd"
                                        ></path>
                                      </svg>
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                  >
                                    {canEditDocuments && (
                                      <>
                                        <DropdownMenuItem
                                          className="flex items-center cursor-pointer"
                                          onClick={() =>
                                            handleRenameBinder(completeBinder)
                                          }
                                        >
                                          <FiEdit className="mr-2" size={14} />
                                          <span>Renommer</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="flex items-center cursor-pointer"
                                          onClick={() =>
                                            handleMoveBinder(completeBinder)
                                          }
                                        >
                                          <FiFolder
                                            className="mr-2"
                                            size={14}
                                          />
                                          <span>Déplacer</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    {canDeleteDocument && (
                                      <DropdownMenuItem
                                        className="flex items-center text-red-500 cursor-pointer"
                                        onClick={() =>
                                          handleDeleteBinder(completeBinder)
                                        }
                                      >
                                        <FiTrash2 className="mr-2" size={14} />
                                        <span>Supprimer</span>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-1">
                                      <img
                                        src={lockSvg || "/placeholder.svg"}
                                        alt="Verrouillé"
                                        className="w-4 h-4 text-gray-400"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Vous n'avez pas la permission de gérer ce
                                      classeur
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          );
                        })}

                        {canUploadDocuments && canManageCupboard && (
                          <div
                            className="flex items-center py-1.5 px-2 rounded-md cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                            onClick={() => handleCreateBinder(cupboard.id)}
                          >
                            <span className="mr-2">
                              <FiFolderPlus size={16} />
                            </span>
                            <span className="text-sm">Ajouter un classeur</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <img
                src={folderSvg || "/placeholder.svg"}
                alt="Dossier"
                className="mx-auto mb-2 w-8 h-8 opacity-40"
              />
              {debouncedSearchQuery || typeFilter ? (
                <>
                  <p className="text-sm">Aucun résultat trouvé</p>
                  <button
                    className="mt-2 text-[#3b5de7] text-sm hover:underline"
                    onClick={clearFilters}
                  >
                    Effacer les filtres
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm">Aucune armoire trouvée</p>
                  <button
                    className="mt-2 text-[#3b5de7] text-sm hover:underline"
                    onClick={handleCreateCupboard}
                  >
                    Créer une armoire
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Dialogs - Only render when open to reduce memory usage */}
        {createCupboardOpen && (
          <CreateCupboardDialog
            open={createCupboardOpen}
            setOpen={setCreateCupboardOpen}
            onSuccess={() => {}}
          />
        )}

        {renameCupboardOpen && selectedCupboardForAction && (
          <RenameCupboardDialog
            cupboard={selectedCupboardForAction}
            open={renameCupboardOpen}
            setOpen={setRenameCupboardOpen}
            onSuccess={() => {}}
          />
        )}

        {deleteCupboardOpen && selectedCupboardForAction && (
          <DeleteCupboardDialog
            cupboard={selectedCupboardForAction}
            open={deleteCupboardOpen}
            setOpen={setDeleteCupboardOpen}
            onSuccess={() => {}}
          />
        )}

        {createBinderOpen && selectedCupboardForAction && (
          <CreateBinderDialog
            cupboardId={selectedCupboardForAction.id}
            open={createBinderOpen}
            setOpen={setCreateBinderOpen}
            onSuccess={() => {}}
          />
        )}

        {renameBinderOpen && selectedBinderForAction && (
          <RenameBinderDialog
            binder={selectedBinderForAction}
            open={renameBinderOpen}
            setOpen={setRenameBinderOpen}
            onSuccess={() => {}}
          />
        )}

        {deleteBinderOpen && selectedBinderForAction && (
          <DeleteBinderDialog
            binder={selectedBinderForAction}
            open={deleteBinderOpen}
            setOpen={setDeleteBinderOpen}
            onSuccess={() => {}}
          />
        )}

        {moveBinderOpen && selectedBinderForAction && (
          <MoveBinderDialog
            binder={selectedBinderForAction}
            open={moveBinderOpen}
            onOpenChange={setMoveBinderOpen}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default FileTree;
