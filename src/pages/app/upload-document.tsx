"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FiLoader } from "react-icons/fi";
import { debounce } from "lodash";
import { getAllCupboards } from "@/services/cupboard";
import { createDocument, extractOcr } from "@/services/document";
import {
  documentSchema,
  type DocumentFormValues,
} from "@/components/upload/schemas/document-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import DocumentForm from "@/components/upload/document-form";
import OcrInfoPanel from "@/components/upload/ocr-info-panel";

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];

  // Récupérer les paramètres d'URL
  const cupboardIdParam = searchParams.get("cupboard_id");
  const binderIdParam = searchParams.get("binder_id");

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedCupboardId, setSelectedCupboardId] = useState<string>(
    cupboardIdParam || ""
  );
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [ocrText, setOcrText] = useState<string>("");
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      binder_id: binderIdParam || "",
      is_searchable: true,
      tags: [],
    },
  });

  const { setValue, handleSubmit, control, reset } = form;

  // Récupérer les armoires et classeurs
  const { data: cupboards, isLoading: isLoadingCupboards } = useQuery({
    queryKey: ["cupboards"],
    queryFn: () => getAllCupboards(),
  });

  // Effet pour définir le binder_id si le paramètre d'URL est présent
  useEffect(() => {
    if (cupboardIdParam && cupboardIdParam !== "null") {
      setSelectedCupboardId(cupboardIdParam);
    }

    if (binderIdParam) {
      // Explicitly set the binder_id in the form
      setValue("binder_id", binderIdParam);

      // If we have a binder ID but no cupboard ID (or it's "null"),
      // find the parent cupboard for this binder
      if (!cupboardIdParam || cupboardIdParam === "null") {
        if (cupboards) {
          const parentCupboard = cupboards.find((cupboard) =>
            cupboard.binders?.some((binder) => binder.id === binderIdParam)
          );

          if (parentCupboard) {
            setSelectedCupboardId(parentCupboard.id);
          }
        }
      }
    }
  }, [binderIdParam, cupboardIdParam, setValue, cupboards]);

  // Add a new useEffect that runs when the component mounts to ensure form values are set
  useEffect(() => {
    // This effect runs once on component mount to ensure form values are set from URL params
    if (binderIdParam) {
      // Force update the form value for binder_id
      setValue("binder_id", binderIdParam);
    }
  }, []);

  // Handle the case when cupboards data loads after component mounts
  useEffect(() => {
    if (
      cupboards &&
      binderIdParam &&
      (!selectedCupboardId || selectedCupboardId === "null")
    ) {
      const parentCupboard = cupboards.find((cupboard) =>
        cupboard.binders?.some((binder) => binder.id === binderIdParam)
      );

      if (parentCupboard) {
        setSelectedCupboardId(parentCupboard.id);
      }
    }
  }, [cupboards, binderIdParam, selectedCupboardId]);

  const extractOcrFromFile = useCallback(
    debounce(async (file: File | null) => {
      if (!file) return;

      // Vérifier si le fichier est une image ou un PDF
      const isImageOrPdf = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ].includes(file.type);

      if (!isImageOrPdf) return;

      try {
        setIsExtractingOcr(true);
        const result = await extractOcr(file);
        setOcrText(result.text);

        // Si le titre n'est pas défini, utiliser les premiers mots du texte OCR comme titre
        if (!getValue("title") && result.text) {
          const suggestedTitle =
            result.text.split(" ").slice(0, 5).join(" ").trim() + "...";
          setValue("title", suggestedTitle);
        }
      } catch (error) {
        console.log("Erreur lors de l'extraction OCR:", error);
      } finally {
        setIsExtractingOcr(false);
      }
    }, 1000),
    [setValue]
  );

  // Mutation pour créer un document
  const createDocumentMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      toast.success("Document créé avec succès");
      reset();
      setFilePreview(null);
      setSelectedFile(null);
      setTags([]);
      setTagInput("");
      setOcrText("");
      navigate(`/document/${data?.id}/permissions`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création du document");
      console.log("error", error);
    },
  });

  useEffect(() => {
    if (selectedFile) {
      extractOcrFromFile(selectedFile);
    }

    // Nettoyage
    return () => {
      extractOcrFromFile.cancel();
    };
  }, [selectedFile, extractOcrFromFile]);

  // Fonction pour obtenir la valeur d'un champ
  const getValue = (field: keyof DocumentFormValues) => {
    return control._formValues[field];
  };

  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValue("file", file);

    // Set the document title from the file name (without extension)
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setValue("title", fileName);

    // Créer un aperçu du fichier
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Gérer l'ajout de tags
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        setValue("tags", newTags);
      }
      setTagInput("");
    }
  };

  // Gérer la suppression de tags
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  // Gérer le changement d'armoire
  const handleCupboardChange = (cupboardId: string) => {
    setSelectedCupboardId(cupboardId);
    setValue("binder_id", "");

    // Update URL to reflect the selected cupboard
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("cupboard_id", cupboardId);
    newParams.delete("binder_id"); // Clear binder when changing cupboard
    navigate(`/upload-document?${newParams.toString()}`, { replace: true });
  };

  // Gérer le changement de classeur
  const handleBinderChange = (binderId: string) => {
    setValue("binder_id", binderId);

    // Update URL to reflect the selected binder
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("binder_id", binderId);
    if (selectedCupboardId) {
      newParams.set("cupboard_id", selectedCupboardId);
    }
    navigate(`/upload-document?${newParams.toString()}`, { replace: true });
  };

  // Gérer la soumission du formulaire
  const onSubmit = async (data: DocumentFormValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("binder_id", data.binder_id);
    formData.append("file", data.file);
    formData.append("is_searchable", data.is_searchable ? "1" : "0");

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    // Si du texte OCR a été extrait, l'ajouter aux données
    if (ocrText) {
      formData.append("ocr", ocrText);
    }

    await createDocumentMutation.mutateAsync(formData);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-800">
          Télécharger un Document
        </h1>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button
            onClick={handleSubmit(onSubmit as any)}
            disabled={
              form.formState.isSubmitting || createDocumentMutation.isPending
            }
            className="bg-[#3b5de7] hover:bg-[#2d4ccc]"
          >
            {form.formState.isSubmitting || createDocumentMutation.isPending ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Téléchargement...
              </>
            ) : (
              "Télécharger le document"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche - Formulaire */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <DocumentForm
                form={form}
                cupboards={cupboards}
                isLoadingCupboards={isLoadingCupboards}
                selectedCupboardId={selectedCupboardId}
                tags={tags}
                tagInput={tagInput}
                selectedFile={selectedFile}
                filePreview={filePreview}
                handleCupboardChange={handleCupboardChange}
                setTagInput={setTagInput}
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
                handleFileChange={handleFileChange}
                setSelectedFile={setSelectedFile}
                setFilePreview={setFilePreview}
                handleBinderChange={handleBinderChange}
                selectedBinderId={binderIdParam || ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Colonne de droite - Informations et aperçu OCR */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Informations</h2>
              <OcrInfoPanel
                ocrText={ocrText}
                isExtractingOcr={isExtractingOcr}
                selectedFile={selectedFile}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
