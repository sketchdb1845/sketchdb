import React from "react";

interface ToolbarProps {
  onAddTable: () => void;
  onExportSQL: () => void;
  onImportSchema: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onSaveProject: () => void;
  onGoToProjects: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddTable, 
  onExportSQL, 
  onImportSchema,
  onExportPNG,
  onExportPDF,
  onSaveProject,
  onGoToProjects,
}) => {
  return (
    <div className="absolute left-4 top-4 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap gap-3 rounded-full border border-[#e8e6dc] bg-[#faf9f5]/95 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <button
        onClick={onAddTable}
        className="cursor-pointer rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
      >
        Add Table
      </button>
      <button
        onClick={onImportSchema}
        className="cursor-pointer rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
      >
        Import Schema
      </button>
      <button
        onClick={onExportSQL}
        className="cursor-pointer rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
      >
        Export to SQL
      </button>
      <button
        onClick={onExportPNG}
        className="cursor-pointer rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
      >
        Export as PNG
      </button>
      <button
        onClick={onExportPDF}
        className="cursor-pointer rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
      >
        Export as PDF
      </button>
      <button
        onClick={onSaveProject}
        className="cursor-pointer rounded-full bg-[#1F1F1E] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#30302e]"
      >
        Save Project
      </button>
      <button
        onClick={onGoToProjects}
        className="cursor-pointer rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
      >
        My Projects
      </button>
    </div>
  );
};
