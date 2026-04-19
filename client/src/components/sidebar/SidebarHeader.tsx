import { DatabaseBackup } from "lucide-react";
import { labelClass } from "./styles";

interface SidebarHeaderProps {
  onGoHome: () => void;
}

export function SidebarHeader({ onGoHome }: SidebarHeaderProps) {
  return (
    <div className="top-0 z-10 mb-5 rounded-[1.5rem] border border-[#e8e6dc] bg-[#faf9f5]/95 px-4 py-4 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e6dc] bg-white text-[#4d4c48] transition hover:bg-[#f5f4ed]"
          onClick={onGoHome}
          aria-label="Go home"
        >
          <DatabaseBackup className="h-5 w-5" />
        </button>
        <div className="text-right">
          <p className={labelClass}>Inspector</p>
          <h3 className="mt-1 font-serif-claude text-2xl leading-none text-[#1F1F1E]">
            Table Attributes
          </h3>
        </div>
      </div>
    </div>
  );
}