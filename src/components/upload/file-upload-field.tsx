"use client";

import type React from "react";
import { FiUpload, FiFile } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FieldErrors } from "react-hook-form";
import type { DocumentFormValues } from "@/components/upload/schemas/document-schema";

interface FileUploadFieldProps {
  selectedFile: File | null;
  filePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
  setFilePreview: (preview: string | null) => void;
  setValue: (name: any, value: any) => void;
  errors: FieldErrors<DocumentFormValues>;
}

export default function FileUploadField({
  selectedFile,
  filePreview,
  handleFileChange,
  setSelectedFile,
  setFilePreview,
  setValue,
  errors,
}: FileUploadFieldProps) {
  return (
    <div>
      <Label htmlFor="file" className="text-base">
        Fichier <span className="text-red-500">*</span>
      </Label>
      <div className="mt-1">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          {!selectedFile ? (
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FiUpload className="h-10 w-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">
                Cliquez pour sélectionner un fichier
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max. 10 Mo)
              </span>
            </label>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                {filePreview ? (
                  <img
                    src={filePreview || "/placeholder.svg"}
                    alt="Aperçu"
                    className="max-h-40 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 rounded-md p-4">
                    <FiFile className="h-8 w-8 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                    setValue("file", undefined as any);
                  }}
                >
                  Supprimer
                </Button>
                <label htmlFor="file">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>Changer</span>
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>
        {errors.file && (
          <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
        )}
      </div>
    </div>
  );
}
