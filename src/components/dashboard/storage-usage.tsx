import { useQuery } from "@tanstack/react-query";
import { getStorageUsage } from "@/services/document";
import {
  FiHardDrive,
  FiImage,
  FiFile,
  FiVideo,
  FiFolder,
} from "react-icons/fi";

interface StorageUsageResponse {
  used_space_documents: string; // e.g., "1.5 MB"
  storage_by_type: {
    pdf: string;
    image: string;
    doc: string;
    video: string;
    other: string;
  };
  file_counts: {
    pdf: number;
    image: number;
    doc: number;
    video: number;
    other: number;
  };
  total_documents: number;
}

// Function to parse human-readable storage values (e.g., "1.5 MB") back to bytes
const parseBytes = (size: string): number => {
  const [value, unit] = size.split(" ");
  const numValue = parseFloat(value);
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };
  return numValue * (units[unit] || 1);
};

// Function to calculate percentage based on total document storage
const getPercentage = (type: string, data: StorageUsageResponse): number => {
  const totalBytes = parseBytes(data.used_space_documents);
  if (totalBytes === 0) return 0;

  let typeBytes = 0;
  if (type === "image") {
    typeBytes = parseBytes(data.storage_by_type.image);
  } else if (type === "document") {
    typeBytes =
      parseBytes(data.storage_by_type.pdf) +
      parseBytes(data.storage_by_type.doc);
  } else if (type === "video") {
    typeBytes = parseBytes(data.storage_by_type.video);
  } else if (type === "other") {
    typeBytes = parseBytes(data.storage_by_type.other);
  }

  return Math.round((typeBytes / totalBytes) * 100);
};

const StorageUsage = () => {
  const { data, isLoading, error } = useQuery<StorageUsageResponse>({
    queryKey: ["storageUsage"],
    queryFn: getStorageUsage,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-7 bg-gray-200 rounded-md w-1/4"></div>
          <div className="h-7 bg-gray-200 rounded-md w-1/3"></div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
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

  // Error state
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

  const { storage_by_type, used_space_documents, file_counts } = data;

  // Calculate percentages dynamically
  const imagePercentage = getPercentage("image", data);
  const docPercentage = getPercentage("document", data);
  const videoPercentage = getPercentage("video", data);
  const otherPercentage = getPercentage("other", data);

  // Simulate total space and free space (since we removed disk_total_space)
  const totalSpace = "500 GB"; // Based on your PC's capacity
  const usedBytes = parseBytes(used_space_documents);
  const totalBytes = parseBytes(totalSpace);
  const freeBytes = totalBytes - usedBytes;
  const freeSpace = (freeBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"; // Convert to GB
  const freePercentage = Math.round((freeBytes / totalBytes) * 100);

  // File types configuration
  const fileTypes = [
    {
      name: "Image",
      icon: <FiImage className="text-green-500" />,
      color: "bg-green-500",
      lightColor: "bg-green-100",
      percentage: imagePercentage,
      size: storage_by_type.image,
    },
    {
      name: "Document",
      icon: <FiFile className="text-yellow-500" />,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-100",
      percentage: docPercentage,
      size: `${
        (parseBytes(storage_by_type.pdf) + parseBytes(storage_by_type.doc)) /
        (1024 * 1024)
      } MB`,
    },
    {
      name: "Video",
      icon: <FiVideo className="text-blue-500" />,
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
      percentage: videoPercentage,
      size: storage_by_type.video,
    },
    {
      name: "Others",
      icon: <FiFolder className="text-pink-500" />,
      color: "bg-pink-500",
      lightColor: "bg-pink-100",
      percentage: otherPercentage,
      size: storage_by_type.other,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FiHardDrive className="text-[#3b5de7] mr-2 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Data Storage
          </h3>
        </div>
        <div className="text-right bg-gray-50 px-3 py-1 rounded-full">
          <span className="font-semibold text-[#3b5de7]">
            {used_space_documents}
          </span>
          <span className="text-gray-500"> out of </span>
          <span className="font-semibold text-gray-700 ">{totalSpace}</span>
          <span className="text-gray-500"> used</span>
        </div>
      </div>

      {/* File types with percentages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {fileTypes.map((type) => (
          <div
            key={type.name}
            className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className={`p-2 rounded-md ${type.lightColor} mr-3`}>
                  {type.icon}
                </div>
                <span className="font-medium text-gray-700 ">{type.name}</span>
              </div>
              <span className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                {type.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div
                className={`h-1.5 rounded-full ${type.color}`}
                style={{ width: `${type.percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-500">{type.size}</div>
          </div>
        ))}
      </div>

      {/* Remaining space */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200  rounded-full mr-2"></div>
          <span className="text-sm font-medium text-gray-600">
            {freeSpace} remaining
          </span>
        </div>
        <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
          {freePercentage}%
        </span>
      </div>

      {/* Global progress bar */}
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5">
        <div className="flex h-full rounded-full overflow-hidden">
          {fileTypes.map((type) => (
            <div
              key={type.name}
              className={`h-full ${type.color}`}
              style={{ width: `${type.percentage}%` }}
              title={`${type.name}: ${type.percentage}%`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorageUsage;
