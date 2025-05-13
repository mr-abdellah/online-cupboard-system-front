"use client";

import { useNavigate, useLocation } from "react-router";

// Import des icônes depuis le dossier assets
import pdfPng from "@/assets/pdf.png";
import imagePng from "@/assets/image.png";
import excelSvg from "@/assets/excel.svg";
import wordSvg from "@/assets/word.svg";
import presentationSvg from "@/assets/powerpoint.svg";
import documentSvg from "@/assets/document.svg";

const FileTypeFilterCards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentFileType = searchParams.get("fileType") || "";

  // Configuration des types de fichiers
  const fileTypes = [
    {
      name: "PDF",
      key: "pdf",
      icon: pdfPng,
      color: "bg-red-500",
      textColor: "text-red-600",
      lightColor: "bg-red-100",
    },
    {
      name: "Excel",
      key: "excel",
      icon: excelSvg,
      color: "bg-green-500",
      textColor: "text-green-600",
      lightColor: "bg-green-100",
    },
    {
      name: "Word",
      key: "doc",
      icon: wordSvg,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      lightColor: "bg-blue-100",
    },
    {
      name: "Images",
      key: "image",
      icon: imagePng,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      lightColor: "bg-purple-100",
    },
    {
      name: "Présentations",
      key: "presentation",
      icon: presentationSvg,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      lightColor: "bg-orange-100",
    },
    {
      name: "Autres",
      key: "",
      icon: documentSvg,
      color: "bg-gray-500",
      textColor: "text-gray-600",
      lightColor: "bg-gray-100",
    },
  ];

  // Handle file type selection
  const handleTypeSelect = (typeValue: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (currentFileType === typeValue) {
      // If clicking the same type, clear the filter
      newParams.delete("fileType");
    } else {
      // Otherwise set the new filter
      newParams.set("fileType", typeValue);
    }

    // Navigate to search page with updated parameters
    navigate(`/search?${newParams.toString()}`);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Filtrer par type de fichier
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {fileTypes.map((type) => {
          const isSelected = currentFileType === type.key;

          return (
            <button
              key={type.key}
              onClick={() => handleTypeSelect(type.key)}
              className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center h-full
                ${
                  isSelected
                    ? `border-${type.color.replace("bg-", "")} ${
                        type.lightColor
                      } bg-opacity-20 shadow-sm`
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              title={`Filtrer par ${type.name}`}
            >
              <div
                className={`p-2 rounded-full ${
                  isSelected ? type.lightColor : "bg-gray-50"
                } mb-2`}
              >
                <img
                  src={type.icon || "/placeholder.svg"}
                  alt={type.name}
                  className="size-8"
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  isSelected ? type.textColor : "text-gray-700"
                }`}
              >
                {type.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FileTypeFilterCards;
