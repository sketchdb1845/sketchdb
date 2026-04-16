import React from "react";

interface ToolbarProps {
  projectTitle: string;
  projectStatus: string;
  projectDescription: string;
  onAddTable: () => void;
  onExportSQL: () => void;
  onImportSchema: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onSaveProject: () => void;
  onGoToProjects: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  projectTitle,
  onAddTable, 
  onExportSQL, 
  onImportSchema,
  onExportPNG,
  onExportPDF,
  onSaveProject,
  onGoToProjects,
}) => {
  return (
    <header className="shrink-0 border-b border-[#343433] bg-[#252423]/95 px-4 py-4 text-[#faf9f5] shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
          </div>
          <h1 className="mt-3 capitalize truncate font-serif-claude text-2xl leading-none text-[#faf9f5] sm:text-2xl">
            {projectTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <button
            onClick={onAddTable}
            className="cursor-pointer rounded-full bg-[#c96442] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
          >
            Add Table
          </button>
          <button
            onClick={onImportSchema}
            className="cursor-pointer rounded-full border border-[#4a4845] bg-[#30302e] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#3a3835]"
          >
            Import Schema
          </button>
          <button
            onClick={onExportSQL}
            className="cursor-pointer rounded-full border border-[#4a4845] bg-[#30302e] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#3a3835]"
          >
            Export to SQL
          </button>
          <button
            onClick={onExportPNG}
            className="cursor-pointer rounded-full border border-[#4a4845] bg-[#30302e] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#3a3835]"
          >
            Export as PNG
          </button>
          <button
            onClick={onExportPDF}
            className="cursor-pointer rounded-full border border-[#4a4845] bg-[#30302e] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#3a3835]"
          >
            Export as PDF
          </button>
          <button
            onClick={onSaveProject}
            className="cursor-pointer rounded-full bg-[#faf9f5] px-4 py-2.5 text-sm font-semibold text-[#1F1F1E] transition hover:bg-[#ede8dc]"
          >
            Save Project
          </button>
          <button
            onClick={onGoToProjects}
            className="cursor-pointer rounded-full border border-[#4a4845] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#30302e]"
          >
            My Projects
          </button>
        </div>
      </div>
    </header>
  );
};
