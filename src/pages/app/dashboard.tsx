"use client";

import StorageUsage from "@/components/dashboard/storage-usage";
import FileExplorer from "@/components/dashboard/file-explorer";

export default function FileManagement() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <main className="mx-auto px-6 py-4">
        {/* Storage Usage Section */}

        <StorageUsage />

        {/* Recent Files Section */}

        <div className="lg:col-span-1">
          <FileExplorer />
        </div>
      </main>
    </div>
  );
}
