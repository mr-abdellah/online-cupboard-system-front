"use client";

import StorageUsage from "@/components/dashboard/storage-usage";
import FileExplorer from "@/components/dashboard/file-explorer";

export default function FileManagement() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <main className="mx-auto px-6 py-4">
        {/* Storage Usage Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              Utilisation du Stockage
            </h2>
            <button className="text-sm text-[#3b5de7] hover:underline">
              Masquer
            </button>
          </div>

          {/* Composant StorageUsage qui utilise useQuery */}
          <StorageUsage />
        </div>

        {/* Recent Files Section */}

        <div className="lg:col-span-1">
          <FileExplorer />
        </div>
      </main>
    </div>
  );
}
