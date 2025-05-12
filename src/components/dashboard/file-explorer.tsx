"use client";
import { useNavigate, useSearchParams } from "react-router";
import FileTree from "./file-tree";
import BinderFiles from "./binder-files";
import BinderImage from "@/assets/binder.png";
import { useQuery } from "@tanstack/react-query";
import { getCupboards } from "@/services/cupboard";
import { useState } from "react";

const FileExplorer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupération des paramètres de l'URL
  const cupboardId = searchParams.get("cupboard_id");
  const binderId = searchParams.get("binder_id");
  const query = searchParams.get("query") || "";
  const fileType = searchParams.get("fileType") || "";

  // Local state to track filter changes
  const [searchQuery, setSearchQuery] = useState(query);
  const [typeFilter, setTypeFilter] = useState(fileType);

  // Fetch cupboards data to find parent relationships
  const { data: cupboards } = useQuery({
    queryKey: ["cupboards"],
    queryFn: () => getCupboards(),
    staleTime: 5 * 60 * 1000,
  });

  // Function to find the parent cupboard for a binder
  const findParentCupboardForBinder = (binderId: string) => {
    if (!cupboards) return null;

    return cupboards.find(
      (cupboard) =>
        cupboard.binders &&
        cupboard.binders.some((binder) => binder.id === binderId)
    );
  };

  // Gestion de la sélection d'un élément
  const handleSelect = (id: string, type: "cupboard" | "binder") => {
    const newParams = new URLSearchParams(searchParams);

    if (type === "cupboard") {
      newParams.set("cupboard_id", id);
      newParams.delete("binder_id");
    } else {
      // For binders, ensure we have the correct parent cupboard ID
      const currentCupboardId =
        cupboardId && cupboardId !== "null" ? cupboardId : null;

      if (currentCupboardId) {
        // If we already have a valid cupboardId, use it
        newParams.set("cupboard_id", currentCupboardId);
        newParams.set("binder_id", id);
      } else {
        // Find the parent cupboard for this binder
        const parentCupboard = findParentCupboardForBinder(id);

        if (parentCupboard) {
          newParams.set("cupboard_id", parentCupboard.id);
          newParams.set("binder_id", id);
        } else {
          // Fallback if we can't find the parent (should be rare)
          newParams.delete("cupboard_id");
          newParams.set("binder_id", id);
        }
      }
    }

    // Preserve search and filter params
    if (query) newParams.set("query", query);
    if (fileType) newParams.set("fileType", fileType);

    navigate(`/dashboard?${newParams.toString()}`);
  };

  // Handle search and filter changes
  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    updateUrlParams({ query: newQuery, fileType });
  };

  const handleFilterChange = (newFileType: string) => {
    setTypeFilter(newFileType);
    updateUrlParams({ query, fileType: newFileType });
  };

  // Update URL parameters without losing existing ones
  const updateUrlParams = ({
    query,
    fileType,
  }: {
    query: string;
    fileType: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (query) {
      newParams.set("query", query);
    } else {
      newParams.delete("query");
    }

    if (fileType) {
      newParams.set("fileType", fileType);
    } else {
      newParams.delete("fileType");
    }

    navigate(`/dashboard?${newParams.toString()}`, { replace: true });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");

    const newParams = new URLSearchParams(searchParams);
    newParams.delete("query");
    newParams.delete("fileType");

    navigate(`/dashboard?${newParams.toString()}`, { replace: true });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Arborescence des fichiers (moitié gauche) */}
      <div className="col-span-1">
        <FileTree
          selectedItem={
            binderId
              ? { id: binderId, type: "binder" }
              : cupboardId
              ? { id: cupboardId, type: "cupboard" }
              : null
          }
          onSelect={handleSelect}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          typeFilter={typeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Fichiers du classeur (moitié droite) */}
      <div className="col-span-1">
        {binderId ? (
          <BinderFiles />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 flex flex-col items-center justify-center h-full">
            <img
              src={BinderImage || "/placeholder.svg"}
              alt="Sélectionnez un classeur"
              className="w-20 h-20 text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-center">
              Sélectionnez un classeur pour afficher son contenu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
