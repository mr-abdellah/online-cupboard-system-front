"use client";
import { useNavigate, useSearchParams } from "react-router";
import FileTree from "./file-tree";
import BinderFiles from "./binder-files";
import BinderImage from "@/assets/binder.png";

const FileExplorer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupération des paramètres de l'URL
  const cupboardId = searchParams.get("cupboard_id");
  const binderId = searchParams.get("binder_id");

  // Gestion de la sélection d'un élément
  const handleSelect = (id: string, type: "cupboard" | "binder") => {
    if (type === "cupboard") {
      navigate(`/dashboard?cupboard_id=${id}`);
    } else {
      navigate(`/dashboard?cupboard_id=${cupboardId}&binder_id=${id}`);
    }
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
        />
      </div>

      {/* Fichiers du classeur (moitié droite) */}
      <div className="col-span-1">
        {binderId ? (
          <BinderFiles />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 flex flex-col items-center justify-center h-full">
            <img
              src={BinderImage}
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
