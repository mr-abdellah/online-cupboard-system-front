"use client";

import { useQuery } from "@tanstack/react-query";
import { getFileTypeStats } from "@/services/document";
import pdfPng from "@/assets/pdf.png";
import excelSvg from "@/assets/excel.svg";
import imagePng from "@/assets/image.png";
import videoPng from "@/assets/video.png";
import wordSvg from "@/assets/word.svg";

export interface FileTypeStatsResponse {
  pdf: number;
  image: number;
  doc: number;
  video: number;
  other: number;
}

const FileStats = () => {
  const { data, isLoading, error } = useQuery<FileTypeStatsResponse>({
    queryKey: ["fileTypeStats"],
    queryFn: getFileTypeStats,
  });

  // Calculer le total pour les pourcentages
  const totalFiles = data
    ? Object.values(data).reduce((sum, count) => sum + count, 0)
    : 0;

  // Configuration des cartes de statistiques
  const statsConfig = [
    {
      key: "pdf",
      type: "Documents PDF",
      description: "Fichiers stockés (PDF)",
      bgColor: "bg-white",
      icon: pdfPng,
    },
    {
      key: "doc",
      type: "Documents Word",
      description: "Fichiers stockés (DOC, DOCX)",
      bgColor: "bg-[#F0F7FF]",
      icon: wordSvg,
    },
    {
      key: "excel",
      type: "Feuilles de calcul",
      description: "Fichiers stockés (XLS, XLSX, CSV)",
      bgColor: "bg-[#F0FFF4]",
      icon: excelSvg,
    },
    {
      key: "image",
      type: "Images",
      description: "Fichiers stockés (JPG, PNG, GIF)",
      bgColor: "bg-[#F5F0FF]",
      icon: imagePng,
    },
    {
      key: "video",
      type: "Vidéos",
      description: "Fichiers stockés (MP4, AVI, MOV)",
      bgColor: "bg-[#FFF8F0]",
      icon: videoPng,
    },
  ];

  // État de chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsConfig.map((stat) => (
          <div
            key={stat.key}
            className={`${stat.bgColor} p-4 rounded-lg shadow-sm flex flex-col animate-pulse`}
          >
            <div
              className="w-full flex justify-center items-center mb-4"
              style={{ height: "160px" }}
            >
              <div className="bg-gray-200 rounded-lg w-2/3 h-2/3"></div>
            </div>
            <div className="w-full">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-500">
        Erreur lors du chargement des statistiques. Veuillez réessayer.
      </div>
    );
  }

  // Mapper les données aux cartes de statistiques
  const fileStats = statsConfig.map((stat) => {
    const count = data
      ? stat.key === "excel"
        ? data.other
        : data[stat.key as keyof FileTypeStatsResponse]
      : 0;
    const percentage =
      totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0;

    return {
      ...stat,
      count,
      percentage: `${percentage}%`,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {fileStats.map((stat) => (
        <div
          key={stat.key}
          className={`${stat.bgColor} p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col`}
        >
          {/* Icône de fichier (2/3 de la carte) */}
          <div
            className="w-full flex justify-center items-center mb-4"
            style={{ height: "160px" }}
          >
            <img
              src={stat.icon || "/placeholder.svg"}
              alt={stat.type}
              className="w-2/3 h-2/3 object-contain"
            />
          </div>

          {/* Informations (1/3 de la carte) */}
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {stat.description}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
              <p className="text-sm font-medium text-gray-500">
                {stat.percentage}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileStats;
