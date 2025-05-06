"use client";

import {
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiEye,
  FiPlus,
  FiLock,
  FiEdit,
} from "react-icons/fi";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getBinder } from "@/services/binder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import des icônes depuis le dossier assets
import documentSvg from "@/assets/document.svg";
import pdfPng from "@/assets/pdf.png";
import imagePng from "@/assets/image.png";
import videoPng from "@/assets/video.png";
import wordSvg from "@/assets/word.svg";
import lockSvg from "@/assets/lock.svg";

// Modifier le composant BinderFiles pour ajouter la navigation
const BinderFiles = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const binderId = searchParams.get("binder_id");
  const cupboardId = searchParams.get("cupboard_id");

  // Fonction pour rediriger vers la page d'upload avec les paramètres
  const handleAddNewFile = () => {
    const queryParams = new URLSearchParams();
    if (binderId) queryParams.append("binder_id", binderId);
    if (cupboardId) queryParams.append("cupboard_id", cupboardId);
    navigate(`/upload-document?${queryParams.toString()}`);
  };

  // Déplacer la requête useQuery ici
  const {
    data: binder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["binder", binderId],
    queryFn: () => getBinder(binderId || ""),
    enabled: !!binderId,
  });

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const documents = binder?.documents || [];

  // Fonction pour sélectionner/désélectionner un fichier
  const toggleFileSelection = (fileId: string, hasViewPermission: boolean) => {
    // Ne pas permettre la sélection si l'utilisateur n'a pas la permission de voir
    if (!hasViewPermission) return;

    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  // Vérifier si l'utilisateur a une permission spécifique pour un document
  const hasPermission = (document: any, permission: string): boolean => {
    return document.permissions?.includes(permission) || false;
  };

  // Obtenir l'icône en fonction du type de fichier
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
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

  // Formater la taille du fichier (simulée car non fournie dans les données)
  // const getFileSize = (path: string) => {
  //   // Simulation de taille basée sur la longueur du chemin
  //   const size = (path.length % 10) + 0.5;
  //   return `${size.toFixed(1)} MB`;
  // };

  // // Formater la date (simulée car non fournie dans les données)
  // const getFormattedDate = (createdAt: string) => {
  //   const date = new Date(createdAt);
  //   return date.toLocaleDateString("fr-FR", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "2-digit",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="h-7 bg-gray-200 rounded-md w-1/4 animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded-md w-28 animate-pulse"></div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center animate-pulse"
            >
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-md mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="col-span-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
              </div>
              <div className="col-span-3">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="col-span-1 flex justify-end">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
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
          Impossible de charger les fichiers du classeur. Veuillez réessayer.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {binder?.name ? `Fichiers: ${binder.name}` : "Fichiers du Classeur"}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleAddNewFile}
            className="text-[#3b5de7] hover:text-[#2d4ccc] p-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <img
            src={documentSvg || "/placeholder.svg"}
            alt="Aucun fichier"
            className="mx-auto mb-2 w-12 h-12 opacity-40"
          />
          <p className="text-sm">Aucun fichier dans ce classeur</p>
          <button
            onClick={handleAddNewFile}
            className="mt-2 text-[#3b5de7] text-sm hover:underline"
          >
            Ajouter un fichier
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          {/* En-tête de tableau */}
          <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-200 text-sm text-gray-500">
            <div className="col-span-5 flex items-center">
              <span>Nom</span>
              <button className="ml-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="col-span-3 flex items-center">
              <span>Dernière modification</span>
              <button className="ml-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="col-span-3 flex items-center">
              <span>Taille</span>
              <button className="ml-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex justify-end">
              <button>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Liste des fichiers */}
          {documents.map((doc) => {
            const hasViewPerm = hasPermission(doc, "view");
            const hasEditPerm = hasPermission(doc, "edit");
            const hasDeletePerm = hasPermission(doc, "delete");
            const hasDownloadPerm = hasPermission(doc, "download");

            return (
              <div
                key={doc.id}
                className={`grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center ${
                  !hasViewPerm
                    ? "opacity-60 bg-gray-50 cursor-not-allowed"
                    : selectedFiles.includes(doc.id)
                    ? "bg-[#f0f4ff]"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
                onClick={() => toggleFileSelection(doc.id, hasViewPerm)}
              >
                <div className="col-span-5 flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center relative">
                    <img
                      src={getFileIcon(doc.type) || "/placeholder.svg"}
                      alt={doc.type}
                      className={`w-full h-full object-contain ${
                        !hasViewPerm ? "opacity-50" : ""
                      }`}
                    />
                    {!hasViewPerm && (
                      <div className="absolute -top-1 -right-1">
                        <img
                          src={lockSvg || "/placeholder.svg"}
                          alt="Verrouillé"
                          className="w-4 h-4"
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium truncate ${
                      !hasViewPerm ? "text-gray-400" : ""
                    }`}
                  >
                    {doc.title}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-gray-500">
                  {/* <div>
                    {getFormattedDate(
                      doc?.created_at || binder?.created_at || ""
                    )}
                  </div> */}
                  <div className="text-xs">
                    {doc.tags && doc.tags.length > 0
                      ? doc.tags.join(", ")
                      : "Aucun tag"}
                  </div>
                </div>
                {/* <div className="col-span-3 text-sm text-gray-500">
                  {getFileSize(doc.path)}
                </div> */}
                <div className="col-span-1 flex justify-end relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="text-gray-400 hover:text-gray-600">
                        <FiMoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {hasViewPerm && (
                        <DropdownMenuItem className="flex items-center cursor-pointer">
                          <FiEye className="mr-2" size={14} />
                          <span>Aperçu</span>
                        </DropdownMenuItem>
                      )}
                      {hasDownloadPerm && (
                        <DropdownMenuItem className="flex items-center cursor-pointer">
                          <FiDownload className="mr-2" size={14} />
                          <span>Télécharger</span>
                        </DropdownMenuItem>
                      )}
                      {hasEditPerm && (
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer"
                          onClick={() => navigate(`/document/${doc.id}/edit`)}
                        >
                          <FiEdit className="mr-2" size={14} />
                          <span>Modifier</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer"
                        onClick={() =>
                          navigate(`/document/${doc.id}/permissions`)
                        }
                      >
                        <FiLock className="mr-2" size={14} />
                        <span>Permissions</span>
                      </DropdownMenuItem>
                      {hasDeletePerm && (
                        <DropdownMenuItem className="flex items-center text-red-500 cursor-pointer">
                          <FiTrash2 className="mr-2" size={14} />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BinderFiles;
