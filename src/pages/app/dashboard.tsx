"use client";

import StorageUsage from "@/components/dashboard/storage-usage";
import FileExplorer from "@/components/dashboard/file-explorer";
import { usePermission } from "@/hooks/usePermission";
import FileTypeFilter from "@/components/dashboard/file-type-filter";

export default function FileManagement() {
  const { canViewDocuments } = usePermission();
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <main className="mx-auto px-6 py-4">
        {/* Storage Usage Section */}
        {canViewDocuments && <FileTypeFilter />}

        <StorageUsage />

        {/* Recent Files Section */}

        {canViewDocuments && (
          <div className="lg:col-span-1">
            <FileExplorer />
          </div>
        )}
      </main>
    </div>
  );
}
