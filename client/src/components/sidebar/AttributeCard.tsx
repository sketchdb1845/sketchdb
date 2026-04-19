import { DATA_TYPES } from "../../types";
import type { AttributeType, DataType, TableAttribute } from "../../types";
import { controlClass, selectClass } from "./styles";
import type { AvailableTable } from "./types";

interface AttributeCardProps {
  attr: TableAttribute;
  idx: number;
  getAvailableTables?: () => AvailableTable[];
  onStartAttrEdit?: (idx: number) => void;
  onAttrEditNameChange?: (idx: number, val: string) => void;
  onAttrEditDataTypeChange?: (idx: number, val: DataType) => void;
  onAttrEditTypeChange?: (idx: number, val: AttributeType) => void;
  onAttrEditRefTableChange?: (idx: number, val: string) => void;
  onAttrEditRefAttrChange?: (idx: number, val: string) => void;
  onSaveAttrName?: (idx: number) => void;
  onCancelAttrEdit?: (idx: number) => void;
  onDeleteAttribute?: (idx: number) => void;
}

export function AttributeCard({
  attr,
  idx,
  getAvailableTables,
  onStartAttrEdit,
  onAttrEditNameChange,
  onAttrEditDataTypeChange,
  onAttrEditTypeChange,
  onAttrEditRefTableChange,
  onAttrEditRefAttrChange,
  onSaveAttrName,
  onCancelAttrEdit,
  onDeleteAttribute,
}: AttributeCardProps) {
  const currentType = attr.editType || attr.type;
  const currentRefTable = attr.editRefTable || attr.refTable || "";
  const currentRefAttr = attr.editRefAttr || attr.refAttr || "";

  return (
    <article className="rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] p-3">
      {attr.isEditing ? (
        <div className="space-y-3">
          <input
            value={attr.editName || ""}
            onChange={(e) => onAttrEditNameChange?.(idx, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveAttrName?.(idx);
              if (e.key === "Escape") onCancelAttrEdit?.(idx);
            }}
            className={controlClass}
            placeholder="Enter attribute name"
            title="Edit attribute name"
            aria-label="Edit attribute name"
            autoFocus
          />
          <select
            value={attr.editDataType || attr.dataType}
            onChange={(e) =>
              onAttrEditDataTypeChange?.(idx, e.target.value as DataType)
            }
            className={selectClass}
            title="Select data type"
          >
            {DATA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={currentType}
            onChange={(e) =>
              onAttrEditTypeChange?.(idx, e.target.value as AttributeType)
            }
            className={selectClass}
            title="Select key type"
          >
            <option value="normal">Normal</option>
            <option value="PK">Primary Key</option>
            <option value="FK">Foreign Key</option>
          </select>

          {currentType === "FK" && (
            <div className="space-y-3 rounded-2xl border border-[#e8e6dc] bg-[#f5f4ed] p-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5e5d59]">
                  Reference Table
                </label>
                <select
                  value={currentRefTable}
                  onChange={(e) => {
                    onAttrEditRefTableChange?.(idx, e.target.value);
                    if (e.target.value !== currentRefTable) {
                      onAttrEditRefAttrChange?.(idx, "");
                    }
                  }}
                  className={selectClass}
                  title="Select reference table for foreign key"
                >
                  <option value="">Select table...</option>
                  {getAvailableTables?.().map((table) => (
                    <option key={table.id} value={table.label}>
                      {table.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5e5d59]">
                  Reference Attribute
                </label>
                <select
                  value={currentRefAttr}
                  onChange={(e) => onAttrEditRefAttrChange?.(idx, e.target.value)}
                  className={selectClass}
                  disabled={!currentRefTable}
                  title="Select reference attribute for foreign key"
                >
                  <option value="">Select attribute...</option>
                  {currentRefTable &&
                    getAvailableTables?.()
                      .find((table) => table.label === currentRefTable)
                      ?.attributes?.map((refAttribute) => (
                        <option key={refAttribute.name} value={refAttribute.name}>
                          {refAttribute.name} ({refAttribute.dataType})
                        </option>
                      ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSaveAttrName?.(idx)}
              className="rounded-full bg-[#1F1F1E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#30302e]"
              title="Save changes"
            >
              Save
            </button>
            <button
              onClick={() => onCancelAttrEdit?.(idx)}
              className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#b53333] transition hover:bg-[#fdf4f4]"
              title="Cancel edit"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium text-[#1F1F1E]">
                  {attr.name || "Unnamed"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    currentType === "PK"
                      ? "bg-[#f7e7b8] text-[#8b6b11]"
                      : currentType === "FK"
                        ? "bg-[#dbeafe] text-[#2f5ea6]"
                        : "bg-[#ece9e2] text-[#5e5d59]"
                  }`}
                >
                  {currentType || "Normal"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#5e5d59]">
                {attr.dataType || "VARCHAR"}
                {attr.type === "FK" && attr.refTable && attr.refAttr
                  ? ` · references ${attr.refTable}.${attr.refAttr}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onStartAttrEdit?.(idx)}
              className="w-1/2 rounded-full border border-[#e8e6dc] bg-white px-3 py-2 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteAttribute?.(idx)}
              className="w-1/2 rounded-full bg-[#b53333] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9f2a2a]"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}