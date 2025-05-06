"use client";

import {
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiEye,
  FiUpload,
  FiLock,
  FiEdit,
} from "react-icons/fi";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getBinder } from "@/services/binder";
import { downloadDocument, type DocumentResponse } from "@/services/document";
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
import LockSvg from "@/assets/lock.svg";
import { DeleteDocumentDialog } from "../document/delete-document-dialog";
import { UpdateDocumentDialog } from "../document/update-document-dialog";
import { DocumentPreviewSheet } from "../document/document-preview-sheet";

// Supprimer les props et utiliser useSearchParams à la place
const BinderFiles = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const binderId = searchParams.get("binder_id");
  const cupboardId = searchParams.get("cupboard_id");

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

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentResponse | null>(null);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

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

  const handleUploadFile = () => {
    navigate(
      `/upload-document?cupboard_id=${cupboardId}&binder_id=${binderId}`
    );
  };

  const handleRedirectToPermission = (document_id: string) => {
    navigate(`/document/${document_id}/permissions`);
  };

  const handleDeleteDocument = (document: any) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleUpdateDocument = (document: any) => {
    setSelectedDocument(document);
    setUpdateDialogOpen(true);
  };

  const handlePreviewDocument = (document: any) => {
    setSelectedDocumentId(document.id);
    setPreviewSheetOpen(true);
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      await downloadDocument(documentId);
    } catch (error) {
      console.error("Error downloading document:", error);
      // You could add a toast notification here for the error
    }
  };

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
          {binder?.name
            ? `Fichiers du Classeur : ${binder.name}`
            : "Fichiers du Classeur"}
        </h3>
        <button
          onClick={handleUploadFile}
          className="text-[#3b5de7] hover:text-[#2d4ccc] bg-blue-50 p-2 rounded-md hover:bg-blue-100 transition-colors"
        >
          <FiUpload size={18} />
        </button>
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
            className="mt-2 text-[#3b5de7] text-sm hover:underline"
            onClick={handleUploadFile}
          >
            Ajouter un fichier
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          {/* En-tête de tableau */}
          <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-200 text-sm text-gray-500">
            <div className="col-span-3 flex items-center">
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

            <div className="col-span-3 flex items-center">
              <span>Tags</span>
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

            <div className="col-span-3 flex items-center"></div>
          </div>

          {/* Liste des fichiers */}
          {documents.map((doc) => {
            const canView = doc?.permissions?.some(
              (permission) => permission === "view"
            );

            const canEdit = doc?.permissions?.some(
              (permission) => permission === "edit"
            );

            const canDelete = doc?.permissions?.some(
              (permission) => permission === "delete"
            );

            const canDownload = doc?.permissions?.some(
              (permission) => permission === "download"
            );

            return (
              <div
                key={doc.id}
                className={`grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center ${
                  selectedFiles.includes(doc.id)
                    ? "bg-[#f0f4ff]"
                    : "hover:bg-gray-50"
                } ${
                  !canView ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => canView && handlePreviewDocument(doc)}
              >
                <div className="col-span-3 flex items-center">
                  <div className="size-12 mr-3 flex items-center justify-center relative">
                    <img
                      src={getFileIcon(doc.type) || "/placeholder.svg"}
                      alt={doc.type}
                      className="w-full h-full object-contain"
                    />
                    {!canView && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60 rounded">
                        <img
                          src={LockSvg}
                          alt="Locked"
                          className="w-4 h-4 opacity-80"
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {doc.title}
                  </span>
                </div>
                <div className="col-span-3 flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center relative">
                    <span className="text-sm font-medium truncate">
                      {doc.type}
                    </span>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-500">
                  <div className="text-xs">
                    {doc.tags && doc.tags.length > 0
                      ? doc.tags.join(", ")
                      : "Aucun tag"}
                  </div>
                </div>

                <div className="col-span-3 flex items-end justify-end relative ">
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
                            handleDownloadDocument(doc?.id);
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
                              handleRedirectToPermission(doc.id);
                            }}
                          >
                            <FiLock className="mr-2" size={14} />
                            <span>Permissions</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateDocument(doc);
                            }}
                          >
                            <FiEdit className="mr-2" size={14} />
                            <span>Modifier</span>
                          </DropdownMenuItem>
                        </>
                      )}

                      {canDelete && (
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
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <DeleteDocumentDialog
        documentId={selectedDocument?.id || null}
        documentTitle={selectedDocument?.title || null}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <UpdateDocumentDialog
        document={selectedDocument}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
      />

      <DocumentPreviewSheet
        documentId={selectedDocumentId}
        open={previewSheetOpen}
        onOpenChange={setPreviewSheetOpen}
      />
    </div>
  );
};

export default BinderFiles;
