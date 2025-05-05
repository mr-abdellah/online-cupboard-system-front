"use client";

import { FiCheck, FiLoader } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";

interface OcrInfoPanelProps {
  ocrText: string;
  isExtractingOcr: boolean;
  selectedFile: File | null;
}

export default function OcrInfoPanel({
  ocrText,
  isExtractingOcr,
  selectedFile,
}: OcrInfoPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700">
          Types de fichiers acceptés
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Taille maximale</h3>
        <p className="text-sm text-gray-500 mt-1">10 Mo</p>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Texte extrait (OCR)
          </h3>
          {isExtractingOcr && (
            <div className="flex items-center text-xs text-gray-500">
              <FiLoader className="animate-spin mr-1" size={12} />
              Extraction...
            </div>
          )}
        </div>

        {ocrText ? (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-[300px] overflow-y-auto">
            {ocrText}
          </div>
        ) : (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic">
            {isExtractingOcr
              ? "Extraction du texte en cours..."
              : selectedFile
              ? "Aucun texte n'a pu être extrait de ce fichier."
              : "Téléchargez une image ou un PDF pour extraire le texte automatiquement."}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-start">
          <FiCheck className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            L'extraction de texte (OCR) permet de rechercher dans le contenu de
            vos documents.
          </p>
        </div>
      </div>
    </div>
  );
}
