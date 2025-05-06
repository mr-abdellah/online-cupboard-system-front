"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  X,
  Download,
  Info,
  FileText,
  ExternalLink,
  Copy,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  displayDocument,
  getDocument,
  downloadDocument,
} from "@/services/document";

// Import the custom icons at the top of the file
import documentSvg from "@/assets/document.svg";
import pdfPng from "@/assets/pdf.png";
import imagePng from "@/assets/image.png";
import videoPng from "@/assets/video.png";
import wordSvg from "@/assets/word.svg";

interface DocumentPreviewSheetProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewSheet({
  documentId,
  open,
  onOpenChange,
}: DocumentPreviewSheetProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch document data
  const documentQuery = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => getDocument(documentId || ""),
    enabled: !!documentId && open,
  });

  const document = documentQuery.data;
  const canDownload = document?.permissions?.some((p) => p === "download");

  // Fetch document display URL
  useEffect(() => {
    if (!documentId || !open) return;

    const fetchDocumentUrl = async () => {
      try {
        const url = await displayDocument(documentId);
        setFileUrl(url);
      } catch (error) {
        console.error("Error fetching document display URL:", error);
      }
    };

    fetchDocumentUrl();

    // Clean up object URL when component unmounts or document changes
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
    };
  }, [documentId, open]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Determine file type
  const fileType = document?.type?.toLowerCase() || "";
  const isPdf = fileType === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "image"].includes(fileType);
  const isVideo = ["mp4", "avi", "mov", "video"].includes(fileType);
  const isText = ["doc", "docx", "txt", "text"].includes(fileType);

  // Get file icon based on type
  const getFileIconForPreview = (type: string) => {
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Inconnu";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return "Date invalide";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0"
        side="right"
      >
        <div className="h-full flex flex-col">
          {documentQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-500">Chargement du document...</p>
            </div>
          ) : documentQuery.isError ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <p>Erreur lors du chargement du document</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => documentQuery.refetch()}
              >
                Réessayer
              </Button>
            </div>
          ) : document ? (
            <>
              <SheetHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex items-center justify-center w-16 h-16 shadow-sm">
                    <img
                      src={getFileIconForPreview(document.type || "")}
                      alt={document.type || "document"}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-xl font-bold truncate">
                      {document.title}
                    </SheetTitle>
                    <SheetDescription className="flex flex-wrap gap-x-2 text-sm mt-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {document.type?.toUpperCase() || "Type inconnu"}
                      </span>
                      {document.created_at && (
                        <>
                          <span>•</span>
                          <span>Créé le {formatDate(document.created_at)}</span>
                        </>
                      )}
                    </SheetDescription>
                  </div>
                  <SheetClose className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fermer</span>
                  </SheetClose>
                </div>

                {document.tags && document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {document.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </SheetHeader>

              <Tabs defaultValue="preview" className="flex-1 px-6 pt-4 pb-6">
                <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full justify-start">
                  <TabsTrigger
                    value="preview"
                    className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 transition-all"
                  >
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 transition-all"
                  >
                    Détails
                  </TabsTrigger>
                  {document.ocr && (
                    <TabsTrigger
                      value="ocr"
                      className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 transition-all"
                    >
                      Texte extrait (OCR)
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent
                  value="preview"
                  className="min-h-[400px] focus-visible:outline-none focus-visible:ring-0"
                >
                  {!fileUrl ? (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                      <p className="text-gray-500">Chargement de l'aperçu...</p>
                    </div>
                  ) : (
                    <>
                      {isVideo && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                          <video
                            controls
                            className="w-full max-h-[500px] rounded"
                            src={fileUrl}
                          >
                            Votre navigateur ne prend pas en charge la lecture
                            vidéo.
                          </video>
                        </div>
                      )}

                      {isPdf && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                          <div className="flex justify-end mb-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8"
                                    onClick={() =>
                                      window.open(fileUrl, "_blank")
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Ouvrir
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ouvrir dans un nouvel onglet</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-[500px] border-0 rounded"
                            title={document.title}
                          />
                        </div>
                      )}

                      {isImage && (
                        <div className="flex flex-col">
                          <div className="flex justify-end mb-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8"
                                    onClick={() =>
                                      window.open(fileUrl, "_blank")
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Voir l'image
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ouvrir l'image en taille réelle</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                            <img
                              src={fileUrl || "/placeholder.svg"}
                              alt={document.title}
                              className="max-h-[500px] rounded object-contain mx-auto"
                            />
                          </div>
                        </div>
                      )}

                      {isText && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm shadow-sm">
                          <div className="flex justify-end mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() =>
                                copyToClipboard(
                                  document.description || document.ocr || ""
                                )
                              }
                            >
                              {copied ? (
                                <>
                                  <span className="text-green-600 dark:text-green-400">
                                    Copié!
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copier
                                </>
                              )}
                            </Button>
                          </div>
                          <pre className="whitespace-pre-wrap max-h-[500px] overflow-y-auto p-4 bg-white dark:bg-gray-900 rounded border dark:border-gray-700">
                            {document.description ||
                              document.ocr ||
                              "Contenu non disponible"}
                          </pre>
                        </div>
                      )}

                      {!isVideo && !isPdf && !isImage && !isText && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                          <FileText className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-gray-500 mb-4">
                            Aperçu non disponible pour ce type de fichier.
                          </p>
                          {canDownload && (
                            <Button
                              variant="outline"
                              onClick={async () => {
                                try {
                                  if (document?.id) {
                                    await downloadDocument(document.id);
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error downloading document:",
                                    error
                                  );
                                  // You could add a toast notification here for the error
                                }
                              }}
                              disabled={!document?.id}
                              className="flex items-center"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent
                  value="details"
                  className="focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-gray-200">
                      Informations détaillées
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Nom:
                        </p>
                        <p className="font-medium truncate">{document.title}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Type:
                        </p>
                        <p className="font-medium">
                          {document.type?.toUpperCase() || "Inconnu"}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Créé le:
                        </p>
                        <p className="font-medium">
                          {formatDate(document.created_at)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Modifié le:
                        </p>
                        <p className="font-medium">
                          {formatDate(document.updated_at)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Recherchable:
                        </p>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full mr-2",
                              document.is_searchable
                                ? "bg-green-500"
                                : "bg-red-500"
                            )}
                          />
                          <p className="font-medium">
                            {document.is_searchable ? "Oui" : "Non"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {document.ocr && (
                  <TabsContent
                    value="ocr"
                    className="focus-visible:outline-none focus-visible:ring-0"
                  >
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                          Texte extrait (OCR)
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(document.ocr || "")}
                        >
                          {copied ? (
                            <span className="text-green-600 dark:text-green-400">
                              Copié!
                            </span>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copier
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-5 font-mono text-sm shadow-sm">
                        <pre className="whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                          {document.ocr || "Aucun texte extrait"}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              <SheetFooter className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t p-4 flex justify-between sm:justify-between gap-2">
                {canDownload && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!canDownload) return;
                      try {
                        if (document?.id) {
                          await downloadDocument(document.id);
                        }
                      } catch (error) {
                        console.error("Error downloading document:", error);
                        // You could add a toast notification here for the error
                      }
                    }}
                    disabled={!document?.id}
                    className="flex items-center"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                )}
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Fermer
                </Button>
              </SheetFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                <Info className="size-12" />
              </div>
              <p className="text-lg font-medium mb-2">
                Aucun document sélectionné
              </p>
              <p className="text-sm text-gray-500 max-w-xs text-center">
                Sélectionnez un document dans la liste pour afficher son aperçu
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
