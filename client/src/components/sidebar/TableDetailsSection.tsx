import { controlClass, panelClass } from "./styles";

interface TableDetailsSectionProps {
  selectedTableLabel: string;
  isEditingTableName: boolean;
  editTableName: string;
  onStartEditTableName?: () => void;
  onSaveTableName?: () => void;
  onCancelEditTableName?: () => void;
  onEditTableNameChange?: (val: string) => void;
  onDeleteTable?: () => void;
}

export function TableDetailsSection({
  selectedTableLabel,
  isEditingTableName,
  editTableName,
  onStartEditTableName,
  onSaveTableName,
  onCancelEditTableName,
  onEditTableNameChange,
  onDeleteTable,
}: TableDetailsSectionProps) {
  return (
    <section className={`${panelClass} bg-[#f5f4ed]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditingTableName ? (
            <div className="mt-3 space-y-3">
              <input
                value={editTableName || ""}
                onChange={(e) => onEditTableNameChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveTableName?.();
                  if (e.key === "Escape") onCancelEditTableName?.();
                }}
                className={controlClass}
                placeholder="Enter table name"
                title="Edit table name"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSaveTableName}
                  className="rounded-full bg-[#1F1F1E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#30302e]"
                >
                  Save
                </button>
                <button
                  onClick={onCancelEditTableName}
                  className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#b53333] transition hover:bg-[#fdf4f4]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartEditTableName}
              className="mt-1 block text-left font-serif-claude text-2xl leading-tight text-[#1F1F1E] transition hover:text-[#c96442]"
              title="Click to edit table name"
            >
              {selectedTableLabel}
            </button>
          )}
        </div>
        <button
          onClick={onDeleteTable}
          className={`${isEditingTableName ? "mt-4" : ""} rounded-full bg-[#b53333] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9f2a2a]`}
          title="Delete table"
        >
          Delete
        </button>
      </div>
    </section>
  );
}