import { panelClass } from "./styles";

export function EmptySelectionState() {
  return (
    <div className={`${panelClass} mt-4 bg-[#f5f4ed] text-center`}>
      <div className="text-4xl">📊</div>
      <p className="mt-4 text-lg font-medium text-[#1F1F1E]">No Table Selected</p>
      <p className="mt-2 text-sm leading-6 text-[#5e5d59]">
        Select a table node to view and edit its attributes.
      </p>
    </div>
  );
}