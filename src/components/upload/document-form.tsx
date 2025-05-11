"use client";

import type React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { FiLoader, FiX } from "react-icons/fi";
import type { DocumentFormValues } from "@/components/upload/schemas/document-schema";
import type { CupboardResponse } from "@/services/cupboard"; // Changé de Cupboard à CupboardResponse
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FileUploadField from "./file-upload-field";

interface DocumentFormProps {
  form: UseFormReturn<DocumentFormValues>;
  cupboards?: CupboardResponse[];
  isLoadingCupboards: boolean;
  selectedCupboardId: string;
  tags: string[];
  tagInput: string;
  selectedFile: File | null;
  filePreview: string | null;
  handleCupboardChange: (cupboardId: string) => void;
  handleBinderChange?: (binderId: string) => void; // Add this line
  setTagInput: (value: string) => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveTag: (tag: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
  setFilePreview: (preview: string | null) => void;
  selectedBinderId?: string;
}

export default function DocumentForm({
  form,
  cupboards,
  isLoadingCupboards,
  selectedCupboardId,
  tags,
  tagInput,
  selectedFile,
  filePreview,
  handleCupboardChange,
  handleBinderChange, // Add this line
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  handleFileChange,
  setSelectedFile,
  setFilePreview,
}: DocumentFormProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;
  // Obtenir les classeurs de l'armoire sélectionnée
  const selectedCupboard = cupboards?.find((c) => c.id === selectedCupboardId);
  const binders = selectedCupboard?.binders || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base">
            Titre du document <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Entrez le titre du document"
            {...register("title")}
            className="mt-1"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-base">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Entrez une description (optionnel)"
            {...register("description")}
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cupboard" className="text-base">
              Armoire <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={handleCupboardChange}
              value={selectedCupboardId}
            >
              <SelectTrigger id="cupboard" className="mt-1">
                <SelectValue placeholder="Sélectionnez une armoire" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCupboards ? (
                  <div className="flex items-center justify-center p-2">
                    <FiLoader className="animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : (
                  cupboards?.map((cupboard) => (
                    <SelectItem key={cupboard.id} value={cupboard.id}>
                      {cupboard.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="binder" className="text-base">
              Classeur <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="binder_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Call handleBinderChange if it exists
                    if (handleBinderChange) {
                      handleBinderChange(value);
                    }
                  }}
                  value={field.value || ""}
                  disabled={!selectedCupboardId || binders.length === 0}
                >
                  <SelectTrigger id="binder" className="mt-1">
                    <SelectValue placeholder="Sélectionnez un classeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {binders.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        {selectedCupboardId
                          ? "Aucun classeur disponible dans cette armoire"
                          : "Sélectionnez d'abord une armoire"}
                      </div>
                    ) : (
                      binders.map((binder) => (
                        <SelectItem key={binder.id} value={binder.id}>
                          {binder.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.binder_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.binder_id.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="tags" className="text-base">
            Mot-clés
          </Label>
          <div className="mt-1">
            <Input
              id="tags"
              placeholder="Ajoutez des tags et appuyez sur Entrée"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="is_searchable"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_searchable"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="is_searchable" className="text-base">
            Activer la recherche dans ce document
          </Label>
        </div>
      </div>

      <Separator />

      <FileUploadField
        selectedFile={selectedFile}
        filePreview={filePreview}
        handleFileChange={handleFileChange}
        setSelectedFile={setSelectedFile}
        setFilePreview={setFilePreview}
        setValue={setValue}
        errors={errors}
      />
    </div>
  );
}
