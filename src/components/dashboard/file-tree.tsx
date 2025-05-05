"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCupboards } from "@/services/cupboard";
import {
  FiChevronRight,
  FiChevronDown,
  FiFolderPlus,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";

// Import des composants shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import des images pour les icônes
import folderSvg from "@/assets/folder.svg";
import binderPng from "@/assets/binder.png";

interface FileTreeProps {
  selectedItem: { id: string; type: "cupboard" | "binder" } | null;
  onSelect: (id: string, type: "cupboard" | "binder") => void;
}

const FileTree = ({ selectedItem, onSelect }: FileTreeProps) => {
  const [expandedCupboards, setExpandedCupboards] = useState<
    Record<string, boolean>
  >({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["cupboards"],
    queryFn: getCupboards,
  });

  // Fonction pour basculer l'état d'expansion d'une armoire
  const toggleCupboard = (cupboardId: string) => {
    setExpandedCupboards((prev) => ({
      ...prev,
      [cupboardId]: !prev[cupboardId],
    }));
  };

  // Effet pour auto-expand lorsqu'un classeur est sélectionné via l'URL
  if (selectedItem?.type === "binder" && data) {
    // Trouver le cupboard contenant ce binder
    const cupboard = data.find(
      (c) => c.binders && c.binders.some((b) => b.id === selectedItem.id)
    );

    if (cupboard && !expandedCupboards[cupboard.id]) {
      setExpandedCupboards((prev) => ({
        ...prev,
        [cupboard.id]: true,
      }));
    }
  }

  // Trier les armoires par ordre
  const sortedCupboards = data
    ? [...data].sort((a, b) => a.order - b.order)
    : [];

  // État de chargement
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="ml-4 mt-3">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
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
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Armoires Documentaires
        </h3>
        <button className="text-[#3b5de7] hover:text-[#2d4ccc] p-1 rounded-md hover:bg-blue-50 transition-colors">
          <FiPlus size={18} />
        </button>
      </div>

      <div className="space-y-1">
        {sortedCupboards.map((cupboard) => {
          // Trier les classeurs par ordre
          const sortedBinders = cupboard.binders
            ? [...cupboard.binders].sort((a, b) => a.order - b.order)
            : [];
          const isExpanded = expandedCupboards[cupboard.id] || false;
          const isSelected =
            selectedItem?.id === cupboard.id &&
            selectedItem?.type === "cupboard";
          const bindersCount = cupboard.binders ? cupboard.binders.length : 0;

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
                  onClick={() => toggleCupboard(cupboard.id)}
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
                  />
                  <span className="text-sm font-medium truncate">
                    {cupboard.name}
                  </span>
                </span>
                <span className="text-xs text-gray-400 mr-2">
                  {bindersCount}
                </span>

                {/* Menu à trois points pour l'armoire avec shadcn/ui DropdownMenu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
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
                    <DropdownMenuItem className="flex items-center cursor-pointer">
                      <FiEdit className="mr-2" size={14} />
                      <span>Renommer</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center cursor-pointer">
                      <FiShare2 className="mr-2" size={14} />
                      <span>Partager</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center text-red-500 cursor-pointer">
                      <FiTrash2 className="mr-2" size={14} />
                      <span>Supprimer</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Classeurs */}
              {isExpanded && (
                <div className="ml-6 pl-2 border-l border-gray-200 mt-1 space-y-1">
                  {sortedBinders.map((binder) => {
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
                              isBinderSelected ? "opacity-100" : "opacity-70"
                            }`}
                          />
                          <span className="text-sm truncate">
                            {binder.name}
                          </span>
                        </span>

                        {/* Menu à trois points pour le classeur avec shadcn/ui DropdownMenu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
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
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <FiEdit className="mr-2" size={14} />
                              <span>Renommer</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <FiShare2 className="mr-2" size={14} />
                              <span>Partager</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center text-red-500 cursor-pointer">
                              <FiTrash2 className="mr-2" size={14} />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                  <div className="flex items-center py-1.5 px-2 rounded-md cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                    <span className="mr-2">
                      <FiFolderPlus size={16} />
                    </span>
                    <span className="text-sm">Ajouter un classeur</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedCupboards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <img
            src={folderSvg || "/placeholder.svg"}
            alt="Dossier"
            className="mx-auto mb-2 w-8 h-8 opacity-40"
          />
          <p className="text-sm">Aucune armoire trouvée</p>
          <button className="mt-2 text-[#3b5de7] text-sm hover:underline">
            Créer une armoire
          </button>
        </div>
      )}
    </div>
  );
};

export default FileTree;
