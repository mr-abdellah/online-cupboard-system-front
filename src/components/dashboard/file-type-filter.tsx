"use client";

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FiSearch, FiX } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FileTypeFilter = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get current search query from URL
  const currentQuery = searchParams.get("query") || "";

  // Local state for search input
  const [searchQuery, setSearchQuery] = useState(currentQuery);

  // Update URL parameters
  const updateUrlParams = (query: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (query) {
      newParams.set("query", query);
    } else {
      newParams.delete("query");
    }

    navigate(`/dashboard?${newParams.toString()}`, { replace: true });
  };

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== currentQuery) {
        updateUrlParams(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentQuery]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    updateUrlParams("");
  };

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

          {currentQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="whitespace-nowrap"
            >
              Effacer la recherche
            </Button>
          )}
        </div>

        {/* Active search filter display */}
        {currentQuery && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              Recherche: {currentQuery}
              <button
                onClick={clearSearch}
                className="ml-1 hover:text-gray-700"
              >
                <FiX size={14} />
              </button>
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTypeFilter;
