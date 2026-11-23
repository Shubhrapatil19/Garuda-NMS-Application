"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { X, FileSpreadsheet } from "lucide-react";

export interface ImportCsvModalProps {
  mounted: boolean;
  isRendered: boolean;
  isVisible: boolean;
  onClose: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  mounted,
  isRendered,
  isVisible,
  onClose,
  onFileUpload,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!mounted || !isRendered) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 select-none overflow-hidden"
    >
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/65 dark:bg-black/80 transition-all duration-300 ease-out cursor-pointer ${
          isVisible ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none"
        }`}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/90 dark:border-[#14233a] shadow-2xl w-full max-w-lg overflow-hidden text-slate-900 dark:text-slate-100 z-10 transition-all duration-300 ease-out transform ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="bg-white dark:bg-[#081220] border-b border-slate-100 dark:border-[#14233a] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-widest block mb-1">
              BATCH INGESTION
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Devices via CSV</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-white dark:bg-[#081220]">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={onFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#0b1626]/50 hover:bg-blue-50/30 dark:hover:bg-sky-950/20 group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Click to select CSV file
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Supports .csv with headers: Name, IP, Vendor, Model, Site, Protocol
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">Max file size: 10 MB</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onDownloadTemplate();
              }}
              className="text-blue-600 dark:text-sky-400 font-medium hover:underline"
            >
              Download template.csv
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImportCsvModal;
