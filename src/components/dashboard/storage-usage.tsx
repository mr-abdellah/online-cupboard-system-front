"use client";

import { useQuery } from "@tanstack/react-query";
import { getStorageUsage } from "@/services/document";
import { FiHardDrive } from "react-icons/fi";

// Import des icônes depuis le dossier assets
import pdfPng from "@/assets/pdf.png";
import imagePng from "@/assets/image.png";
import ExcelSvg from "@/assets/excel.svg";
import wordSvg from "@/assets/word.svg";
import documentSvg from "@/assets/document.svg";

// Fonction pour calculer le pourcentage à partir des chaînes formatées
const calculatePercentage = (part: string, total: string): number => {
  // Fonction pour extraire la valeur numérique et l'unité
  const extractValueAndUnit = (sizeStr: string) => {
    const match = sizeStr?.match(/^([\d.]+)\s*([KMGT]?B)$/i);
    if (!match) return { value: 0, unit: "B" };

    const value = Number?.parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    return { value, unit };
  };

  // Convertir en bytes pour comparer
  const convertToBytes = (size: { value: number; unit: string }) => {
    const units = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };
    return size.value * (units[size.unit as keyof typeof units] || 1);
  };

  const partSize = extractValueAndUnit(part);
  const totalSize = extractValueAndUnit(total);

  const partBytes = convertToBytes(partSize);
  const totalBytes = convertToBytes(totalSize);

  if (totalBytes === 0) return 0;
  return Math.round((partBytes / totalBytes) * 100);
};

const StorageUsage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["storageUsage"],
    queryFn: getStorageUsage,
  });

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-7 bg-gray-200 rounded-md w-1/4"></div>
          <div className="h-7 bg-gray-200 rounded-md w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="flex justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded-md w-1/4"></div>
          <div className="h-5 bg-gray-200 rounded-md w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full"></div>
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
          Impossible de charger les données d'utilisation du stockage. Veuillez
          réessayer.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const {
    free_space,
    used_space,
    total_space,
    storage_by_type,
    file_type_stats,
  } = data;

  // Calculer les pourcentages
  const usedPercentage = calculatePercentage(used_space, total_space);
  const freePercentage = 100 - usedPercentage;

  // Calculer les pourcentages pour chaque type de fichier
  const pdfPercentage = calculatePercentage(storage_by_type?.pdf, total_space);
  const imagePercentage = calculatePercentage(
    storage_by_type?.image,
    total_space
  );
  const docPercentage = calculatePercentage(storage_by_type?.doc, total_space);
  const videoPercentage = calculatePercentage(
    storage_by_type?.excel,
    total_space
  );
  const otherPercentage = calculatePercentage(
    storage_by_type?.other,
    total_space
  );

  // Configuration des types de fichiers
  const fileTypes = [
    {
      name: "PDF",
      key: "pdf",
      icon: pdfPng,
      color: "bg-red-500",
      textColor: "text-red-600",
      lightColor: "bg-red-100",
      percentage: pdfPercentage,
      size: storage_by_type?.pdf,
      count: file_type_stats?.pdf,
    },
    {
      name: "Documents",
      key: "doc",
      icon: wordSvg,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      lightColor: "bg-blue-100",
      percentage: docPercentage,
      size: storage_by_type?.doc,
      count: file_type_stats?.doc,
    },
    {
      name: "Images",
      key: "image",
      icon: imagePng,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      lightColor: "bg-purple-100",
      percentage: imagePercentage,
      size: storage_by_type?.image,
      count: file_type_stats?.image,
    },
    {
      name: "Excel",
      key: "excel",
      icon: ExcelSvg,
      color: "bg-green-500",
      textColor: "text-green-600",
      lightColor: "bg-green-100",
      percentage: videoPercentage,
      size: storage_by_type?.excel,
      count: file_type_stats?.excel,
    },
    {
      name: "Autres",
      key: "other",
      icon: documentSvg,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      lightColor: "bg-yellow-100",
      percentage: otherPercentage,
      size: storage_by_type?.other,
      count: file_type_stats?.other,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FiHardDrive className="text-[#3b5de7] mr-2 text-2xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Stockage de Données
          </h3>
        </div>
        <div className="text-right bg-gray-50 px-4 py-2 rounded-full">
          <span className="font-semibold text-[#3b5de7]">{used_space}</span>
          <span className="text-gray-500"> sur </span>
          <span className="font-semibold text-gray-700">{total_space}</span>
          <span className="text-gray-500"> utilisés</span>
        </div>
      </div>

      <>
        {/* Types de fichiers avec pourcentages - Nouvelle mise en page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {fileTypes.map((type) => (
            <div
              key={type.key}
              className={`p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 ${type.lightColor} bg-opacity-10`}
            >
              <div className="flex flex-col items-center mb-3">
                <div
                  className={`p-3 rounded-full ${type.lightColor} mb-3 flex items-center justify-center`}
                >
                  <img
                    src={type.icon || "/placeholder.svg"}
                    alt={type.name}
                    className="size-20"
                  />
                </div>
                <span className={`font-medium ${type.textColor}`}>
                  {type.name}
                </span>
              </div>

              <div className="text-center mb-3">
                <span className={`text-xl font-bold ${type.textColor}`}>
                  {type.percentage}%
                </span>
              </div>

              <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${type.color}`}
                  style={{ width: `${type.percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center mt-2 text-center">
                <div className="w-1/2">
                  <span className="text-xs text-gray-500 block">Fichiers</span>
                  <span className="font-semibold text-gray-700">
                    {type.count}
                  </span>
                </div>
                <div className="w-1/2">
                  <span className="text-xs text-gray-500 block">Taille</span>
                  <span className="font-semibold text-gray-700">
                    {type.size}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Espace restant */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600">
              {free_space} restants
            </span>
          </div>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            {freePercentage}%
          </span>
        </div>

        {/* Barre de progression globale */}
        <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden p-1">
          <div className="flex h-full rounded-full overflow-hidden">
            {fileTypes.map((type) => (
              <div
                key={type.key}
                className={`h-full w-20 ${type.color}`}
                style={{ width: `${type.percentage}%` }}
                title={`${type.name}: ${type.percentage}%`}
              ></div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap mt-4 justify-center">
          {fileTypes.map((type) => (
            <div key={type.key} className="flex items-center mx-3 my-1">
              <div className={`w-3 h-3 rounded-full ${type.color} mr-1`}></div>
              <span className="text-xs text-gray-600">{type.name}</span>
            </div>
          ))}
        </div>
      </>
    </div>
  );
};

export default StorageUsage;
