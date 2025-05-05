"use client";

import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./sidebar";
import { FiBell, FiChevronDown } from "react-icons/fi";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-end px-6 py-3">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Upgrade
              </button>
              <div className="relative">
                <div className="relative">
                  <FiBell className="h-6 w-6 text-gray-700" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
                    1
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Avatar utilisateur"
                />
                <FiChevronDown className="ml-1 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
