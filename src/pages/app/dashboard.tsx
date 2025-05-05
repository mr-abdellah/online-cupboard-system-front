"use client";

import { FiMoreVertical } from "react-icons/fi";
import FileStats from "@/components/dashboard/file-stats";
import StorageUsage from "@/components/dashboard/storage-usage";

// Import des icônes depuis le dossier assets
import documentSvg from "@/assets/document.svg";
import pdfPng from "@/assets/pdf.png";
import excelSvg from "@/assets/excel.svg";
import reactSvg from "@/assets/react.svg";

export default function FileManagement() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <main className="mx-auto px-6 py-4">
        {/* Statistique Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Statistique</h2>
            <button className="text-sm text-[#3b5de7] hover:underline">
              Masquer
            </button>
          </div>

          {/* Composant FileStats qui utilise useQuery */}
          <FileStats />
        </div>

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
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Recent</h2>
            <button className="text-sm text-blue-600 hover:underline">
              Hide
            </button>
          </div>

          <div className="border-t border-gray-200">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-200 text-sm text-gray-500">
              <div className="col-span-5 flex items-center">
                <span>Name</span>
                <button className="ml-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="col-span-3 flex items-center">
                <span>Last edit</span>
                <button className="ml-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="col-span-3 flex items-center">
                <span>Size</span>
                <button className="ml-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M4 6H20M4 12H20M4 18H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* File Rows */}
            {/* Site Map.pdf */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img
                    src={pdfPng || "/placeholder.svg"}
                    alt="PDF"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium">Site Map.pdf</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                <div>12.12.19 5:54 am</div>
                <div className="text-xs">by Anton Pavlenko</div>
              </div>
              <div className="col-span-3 text-sm text-gray-500">0.9 MB</div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <FiMoreVertical className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* UIKit.sketch */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img
                    src={reactSvg || "/placeholder.svg"}
                    alt="Sketch"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium">UIKit.sketch</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                <div>02.12.19 0:12 am</div>
                <div className="text-xs">by you</div>
              </div>
              <div className="col-span-3 text-sm text-gray-500">11.0 MB</div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <FiMoreVertical className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* AnnualReport.xls */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img
                    src={excelSvg || "/placeholder.svg"}
                    alt="Excel"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium">AnnualReport.xls</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                <div>22.11.19 1:15 pm</div>
                <div className="text-xs">by Dmytro Kosovyi</div>
              </div>
              <div className="col-span-3 text-sm text-gray-500">4.1 MB</div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <FiMoreVertical className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* CaseStudies.pdf */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img
                    src={documentSvg || "/placeholder.svg"}
                    alt="PDF"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium">CaseStudies.pdf</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                <div>19.11.19 8:21 pm</div>
                <div className="text-xs">by Monica Smith</div>
              </div>
              <div className="col-span-3 text-sm text-gray-500">2.7 MB</div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <FiMoreVertical className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Wireframes.sketch */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img
                    src={reactSvg || "/placeholder.svg"}
                    alt="Sketch"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium">Wireframes.sketch</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                <div>14.11.19 4:38 am</div>
                <div className="text-xs">by Chris Haslam</div>
              </div>
              <div className="col-span-3 text-sm text-gray-500">1.5 MB</div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <FiMoreVertical className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Illustrations.ai */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
              <div className="col-span-5 flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img
                    src={reactSvg || "/placeholder.svg"}
                    alt="AI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium">Illustrations.ai</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                <div>09.11.19 2:02 pm</div>
                <div className="text-xs">by Rocket Too</div>
              </div>
              <div className="col-span-3 text-sm text-gray-500">92.1 MB</div>
              <div className="col-span-1 flex justify-end">
                <button>
                  <FiMoreVertical className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
