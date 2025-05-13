"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FiSearch, FiX } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FileTypeFilter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current search query from URL
  const searchParams = new URLSearchParams(location.search);
  const currentQuery = searchParams.get("query") || "";
  const currentFileType = searchParams.get("fileType") || "";

  // Local state for search input
  const [searchQuery, setSearchQuery] = useState(currentQuery);

  // Update URL parameters
  const handleSearch = () => {
    const newParams = new URLSearchParams();

    if (searchQuery) {
      newParams.set("query", searchQuery);
    }

    if (currentFileType) {
      newParams.set("fileType", currentFileType);
    }

    navigate(`/search?${newParams.toString()}`);
  };

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(location.search);
    newParams.delete("query");
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Clear file type filter
  const clearFileTypeFilter = () => {
    const newParams = new URLSearchParams(location.search);
    newParams.delete("fileType");
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    navigate(location.pathname, { replace: true });
  };

  // Update local state when URL changes
  useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  return (
    <div className="mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search input */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher des documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-4 py-2 w-full"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <Button
            onClick={handleSearch}
            className="bg-[#3b5de7] hover:bg-[#2d4ccc] text-white"
          >
            Rechercher
          </Button>

          {(currentQuery || currentFileType) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="whitespace-nowrap"
            >
              Effacer tous les filtres
            </Button>
          )}
        </div>

        {/* Active filters display */}
        {(currentQuery || currentFileType) && (
          <div className="flex flex-wrap gap-2">
            {currentQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Recherche: {currentQuery}
                <button
                  onClick={clearSearch}
                  className="ml-1 hover:text-gray-700"
                >
                  <FiX size={14} />
                </button>
              </Badge>
            )}

            {currentFileType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type:{" "}
                {currentFileType.includes(",")
                  ? currentFileType
                      .split(",")
                      .map((t) => t.toUpperCase())
                      .join(", ")
                  : currentFileType.toUpperCase()}
                <button
                  onClick={clearFileTypeFilter}
                  className="ml-1 hover:text-gray-700"
                >
                  <FiX size={14} />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTypeFilter;
