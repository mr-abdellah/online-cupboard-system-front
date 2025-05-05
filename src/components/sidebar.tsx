"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  FiHome,
  FiUsers,
  FiActivity,
  FiChevronLeft,
  FiUpload,
} from "react-icons/fi";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle();
  };

  const navItems = [
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <FiHome size={20} />,
    },
    {
      name: "Utilisateurs",
      path: "/users",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Journaux d'activité",
      path: "/activity-logs",
      icon: <FiActivity size={20} />,
    },
    {
      name: "Upload document",
      path: "/upload-document",
      icon: <FiUpload size={20} />,
    },
  ];

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo - hauteur ajustée pour correspondre à l'en-tête du layout */}
      <div className="h-[57px] flex items-center border-b border-gray-200">
        <div className="flex items-center px-4">
          <div className="bg-[#3b5de7] p-2 rounded-md mr-3 text-white">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-medium text-gray-800">Media-doc</span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto mr-4 text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#f0f4ff] text-[#3b5de7]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div
                  className={`flex items-center justify-center ${
                    isActive ? "text-[#3b5de7]" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pied de page de la sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-8 w-8 rounded-full"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Avatar utilisateur"
            />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Jean Dupont</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
