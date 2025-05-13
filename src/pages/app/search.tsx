"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  searchDocuments,
  type FileCategory,
  type DocumentSearchResponse,
} from "@/services/document";
import FileTypeFilter from "@/components/dashboard/file-type-filter";
import FileTypeFilterCards from "@/components/dashboard/file-type-filter-cards";
import {
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiEye,
  FiLock,
  FiEdit,
  FiFolder,
  FiCopy,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Import des icônes depuis le dossier assets
import documentSvg from "@/assets/document.svg";
import pdfPng from "@/assets/pdf.png";
import imagePng from "@/assets/image.png";
import wordSvg from "@/assets/word.svg";
import excelSvg from "@/assets/excel.svg";
import presentationSvg from "@/assets/powerpoint.svg";
import LockSvg from "@/assets/lock.svg";

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query") || "";
  const fileType = searchParams.get("fileType") as FileCategory | null;

  const [page, setPage] = useState(1);
  const perPage = 15;

  // Reset page when search params change
  useEffect(() => {
    setPage(1);
  }, [query, fileType]);

  // Fetch search results
  const { data, isLoading, error } = useQuery({
    queryKey: ["documentSearch", query, fileType, page, perPage],
    queryFn: () => searchDocuments(query, fileType || undefined, page, perPage),
  });

  // Set page title based on search parameters
  useEffect(() => {
    let title = "Recherche de documents";

    if (fileType) {
      title += ` - Type: ${fileType}`;
    }

    if (query) {
      title += ` - Recherche: ${query}`;
    }

    document.title = title;
  }, [fileType, query]);

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
      case "xls":
      case "xlsx":
      case "excel":
        return excelSvg;
      case "ppt":
      case "pptx":
      case "presentation":
        return presentationSvg;
      default:
        return documentSvg;
    }
  };

  // Handle document actions
  const handlePreviewDocument = (document: DocumentSearchResponse) => {
    // Implement preview functionality
    console.log("Preview document:", document);
  };

  const handleDownloadDocument = (document: DocumentSearchResponse) => {
    // Implement download functionality
    console.log("Download document:", document);
  };

  const handleEditPermissions = (document: DocumentSearchResponse) => {
    // Implement permissions functionality
    console.log("Edit permissions for document:", document);
  };

  const handleEditDocument = (document: DocumentSearchResponse) => {
    // Implement edit functionality
    console.log("Edit document:", document);
  };

  const handleMoveDocument = (document: DocumentSearchResponse) => {
    // Implement move functionality
    console.log("Move document:", document);
  };

  const handleCopyDocument = (document: DocumentSearchResponse) => {
    // Implement copy functionality
    console.log("Copy document:", document);
  };

  const handleDeleteDocument = (document: DocumentSearchResponse) => {
    // Implement delete functionality
    console.log("Delete document:", document);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-800 font-sans">
        <main className="mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-6">Recherche de documents</h1>

          {/* Search and filter controls */}
          <FileTypeFilter />

          {/* File type filter cards */}
          <div className="mb-6">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

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
                  <div className="col-span-4 flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-md mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="col-span-3">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-800 font-sans">
        <main className="mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-6">Recherche de documents</h1>

          {/* Search and filter controls */}
          <FileTypeFilter />

          {/* File type filter cards */}
          <FileTypeFilterCards />

          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <div className="flex items-center text-red-600 mb-2">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="font-medium">Erreur de recherche</h3>
            </div>
            <p className="text-sm text-red-500">
              Impossible de charger les résultats de recherche. Veuillez
              réessayer.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const documents = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <main className="mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold mb-6">Recherche de documents</h1>

        {/* Search and filter controls */}
        <FileTypeFilter />

        {/* File type filter cards */}
        <FileTypeFilterCards />

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Résultats de recherche
              {pagination && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({pagination.total} documents trouvés)
                </span>
              )}
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <img
                src={documentSvg || "/placeholder.svg"}
                alt="Aucun résultat"
                className="mx-auto mb-2 w-12 h-12 opacity-40"
              />
              <p className="text-sm">
                Aucun document trouvé pour cette recherche
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              {/* En-tête de tableau */}
              <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-200 text-sm text-gray-500">
                <div className="col-span-4 flex items-center">
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

                <div className="col-span-2 flex items-center">
                  <span>Type</span>
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

                <div className="col-span-2 flex items-center">
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

                <div className="col-span-3 flex items-center">
                  <span>Emplacement</span>
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

                <div className="col-span-1 flex items-center"></div>
              </div>

              {/* Liste des fichiers */}
              {documents.map((doc) => {
                const canView = doc.can_view;
                const canEdit = doc.permissions.includes("edit");
                const canDelete = doc.permissions.includes("delete");
                const canDownload = doc.permissions.includes("download");

                return (
                  <div
                    key={`${doc.name}-${doc.cupboard}-${doc.binder}`}
                    className={`grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center ${
                      !canView
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => canView && handlePreviewDocument(doc)}
                  >
                    <div className="col-span-4 flex items-center">
                      <div className="size-12 mr-3 flex items-center justify-center relative">
                        <img
                          src={getFileIcon(doc.type) || "/placeholder.svg"}
                          alt={doc.type}
                          className="w-full h-full object-contain"
                        />
                        {!canView && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60 rounded">
                            <img
                              src={LockSvg || "/placeholder.svg"}
                              alt="Locked"
                              className="w-4 h-4 opacity-80"
                            />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">
                        {doc.name}
                      </span>
                    </div>

                    <div className="col-span-2 text-sm text-gray-600">
                      {doc.type}
                    </div>

                    <div className="col-span-2 text-sm text-gray-600">
                      {doc.size}
                    </div>

                    <div className="col-span-3 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.cupboard}</span>
                        <span className="text-xs text-gray-500">
                          {doc.binder}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1 flex items-end justify-end relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                          disabled={!canView}
                        >
                          <button
                            className={`text-gray-400 hover:text-gray-600 ${
                              !canView ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <FiMoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {canView && (
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewDocument(doc);
                              }}
                            >
                              <FiEye className="mr-2" size={14} />
                              <span>Aperçu</span>
                            </DropdownMenuItem>
                          )}

                          {canDownload && (
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadDocument(doc);
                              }}
                            >
                              <FiDownload className="mr-2" size={14} />
                              <span>Télécharger</span>
                            </DropdownMenuItem>
                          )}

                          {canEdit && (
                            <>
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPermissions(doc);
                                }}
                              >
                                <FiLock className="mr-2" size={14} />
                                <span>Permissions</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDocument(doc);
                                }}
                              >
                                <FiEdit className="mr-2" size={14} />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveDocument(doc);
                                }}
                              >
                                <FiFolder className="mr-2" size={14} />
                                <span>Déplacer</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyDocument(doc);
                                }}
                              >
                                <FiCopy className="mr-2" size={14} />
                                <span>Copier</span>
                              </DropdownMenuItem>
                            </>
                          )}

                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="flex items-center text-red-500 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc);
                                }}
                              >
                                <FiTrash2 className="mr-2" size={14} />
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <FiChevronLeft size={16} />
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.last_page ||
                        (p >= page - 1 && p <= page + 1)
                    )
                    .map((p, i, arr) => {
                      // Add ellipsis
                      if (i > 0 && arr[i - 1] !== p - 1) {
                        return (
                          <div
                            key={`ellipsis-${p}`}
                            className="flex items-center space-x-1"
                          >
                            <span className="text-gray-500">...</span>
                            <Button
                              variant={p === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(p)}
                              className={p === page ? "bg-[#3b5de7]" : ""}
                            >
                              {p}
                            </Button>
                          </div>
                        );
                      }

                      return (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(p)}
                          className={p === page ? "bg-[#3b5de7]" : ""}
                        >
                          {p}
                        </Button>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.last_page}
                >
                  <FiChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
