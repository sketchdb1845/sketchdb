import React from "react";
import type { Node } from "@xyflow/react";
import type { TableAttribute, AttributeType, DataType } from "../types/index";
import { DATA_TYPES, TABLE_COLOR_OPTIONS } from "../types/index";
import { DatabaseBackup } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TABLE_COLOR_CLASS_MAP: Record<string, string> = {
  "#14b8a6": "bg-[#14b8a6]",
  "#0f766e": "bg-[#0f766e]",
  "#3b82f6": "bg-[#3b82f6]",
  "#6366f1": "bg-[#6366f1]",
  "#8b5cf6": "bg-[#8b5cf6]",
  "#ec4899": "bg-[#ec4899]",
  "#ef4444": "bg-[#ef4444]",
  "#f97316": "bg-[#f97316]",
  "#eab308": "bg-[#eab308]",
  "#22c55e": "bg-[#22c55e]",
  "#6b7280": "bg-[#6b7280]",
};

interface SidebarProps {
  selectedTable?: Node;
  attributes?: TableAttribute[];
  isEditingTableName: boolean;
  editTableName: string;
  attrName: string;
  attrType: AttributeType;
  attrDataType: DataType;
  tableColor: string;
  refTable: string;
  refAttr: string;
  onStartEditTableName?: () => void;
  onSaveTableName?: () => void;
  onCancelEditTableName?: () => void;
  onEditTableNameChange?: (val: string) => void;
  onDeleteTable?: () => void;
  onAttrNameChange?: (val: string) => void;
  onAttrDataTypeChange?: (val: DataType) => void;
  onAttrTypeChange?: (val: AttributeType) => void;
  onTableColorChange?: (val: string) => void;
  onRefTableChange?: (val: string) => void;
  onRefAttrChange?: (val: string) => void;
  onAddAttribute?: () => void;
  onStartAttrEdit?: (idx: number) => void;
  onAttrEditNameChange?: (idx: number, val: string) => void;
  onAttrEditDataTypeChange?: (idx: number, val: DataType) => void;
  onAttrEditTypeChange?: (idx: number, val: AttributeType) => void;
  onAttrEditRefTableChange?: (idx: number, val: string) => void;
  onAttrEditRefAttrChange?: (idx: number, val: string) => void;
  onSaveAttrName?: (idx: number) => void;
  onCancelAttrEdit?: (idx: number) => void;
  onDeleteAttribute?: (idx: number) => void;
  getAvailableTables?: () => Array<{
    id: string;
    label: string;
    attributes: any[];
  }>;
}

const panelClass =
  "rounded-[1.5rem] border border-[#e8e6dc] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]";
const labelClass =
  "font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]";
const controlClass =
  "w-full rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15";
const selectClass =
  "w-full rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-[#1F1F1E] outline-none transition focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15";

export const Sidebar: React.FC<SidebarProps> = ({
  selectedTable,
  attributes = [],
  isEditingTableName,
  editTableName,
  attrName,
  attrType,
  attrDataType,
  tableColor,
  refTable,
  refAttr,
  onStartEditTableName,
  onSaveTableName,
  onCancelEditTableName,
  onEditTableNameChange,
  onDeleteTable,
  onAttrNameChange,
  onAttrDataTypeChange,
  onAttrTypeChange,
  onTableColorChange,
  onRefTableChange,
  onRefAttrChange,
  onAddAttribute,
  onStartAttrEdit,
  onAttrEditNameChange,
  onAttrEditDataTypeChange,
  onAttrEditTypeChange,
  onAttrEditRefTableChange,
  onAttrEditRefAttrChange,
  onSaveAttrName,
  onCancelAttrEdit,
  onDeleteAttribute,
  getAvailableTables,
}) => {
  const navigate = useNavigate();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const currentTableColor = tableColor || TABLE_COLOR_OPTIONS[0];
  const selectedTableLabel =
    typeof selectedTable?.data?.label === "string"
      ? selectedTable.data.label
      : `Table ${selectedTable?.id}`;

  React.useEffect(() => {
    sidebarRef.current?.style.setProperty("--table-color", currentTableColor);
  }, [currentTableColor]);

  return (
    <aside
      ref={sidebarRef}
      className="w-[25rem] shrink-0 overflow-y-auto border-r border-[#e8e6dc] bg-[#faf9f5] px-4 py-5 text-[#1F1F1E] shadow-[0_16px_50px_rgba(0,0,0,0.06)] lg:px-5"
    >
      <div  className="top-0 z-10 mb-5 rounded-[1.5rem] border border-[#e8e6dc] bg-[#faf9f5]/95 px-4 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e6dc] bg-white text-[#4d4c48] transition hover:bg-[#f5f4ed]"
            onClick={() => navigate("/")}
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

      {selectedTable ? (
        <div className="space-y-4">
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
                  <>
                    <button
                      type="button"
                      onClick={onStartEditTableName}
                      className="mt-1 block text-left font-serif-claude text-2xl leading-tight text-[#1F1F1E] transition hover:text-[#c96442]"
                      title="Click to edit table name"
                    >
                      {selectedTableLabel}
                    </button>
                  </>
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

          <section className={panelClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={labelClass}>Table Color</p>
                <p className="mt-2 text-sm leading-6 text-[#5e5d59]">
                  Pick a swatch or enter a custom hex value.
                </p>
              </div>
              <span className="rounded-full border border-[#e8e6dc] bg-[#f5f4ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5d59]">
                {currentTableColor}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-6 gap-2">
              {TABLE_COLOR_OPTIONS.map((color) => {
                const isSelected =
                  currentTableColor.toLowerCase() === color.toLowerCase();

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onTableColorChange?.(color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? "scale-110 border-[#1F1F1E] shadow-[0_0_0_2px_rgba(201,100,66,0.18)]"
                        : "border-transparent hover:scale-105"
                    } ${TABLE_COLOR_CLASS_MAP[color] || "bg-gray-500"}`}
                    title={color}
                    aria-label={`Set table color to ${color}`}
                  />
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="color"
                value={currentTableColor}
                onChange={(e) => onTableColorChange?.(e.target.value)}
                className="h-11 w-12 rounded-xl border border-[#e8e6dc] bg-transparent p-1"
                title="Custom table color"
                aria-label="Custom table color"
              />
              <div className="flex-1 rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] px-3 py-2.5 text-sm text-[#5e5d59]">
                Custom hex:{" "}
                <span className="font-mono">
                  {currentTableColor.toUpperCase()}
                </span>
              </div>
            </div>
          </section>

          <section className={panelClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={labelClass}>Attributes</p>
                <p className="mt-2 text-sm leading-6 text-[#5e5d59]">
                  Edit names, types, and foreign-key references.
                </p>
              </div>
              <span className="rounded-full border border-[#e8e6dc] bg-[#f5f4ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5d59]">
                {attributes.length}
              </span>
            </div>

            {attributes.length > 0 ? (
              <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                {attributes.map((attr, idx) => {
                  const currentType = attr.editType || attr.type;
                  const currentRefTable =
                    attr.editRefTable || attr.refTable || "";
                  const currentRefAttr = attr.editRefAttr || attr.refAttr || "";

                  return (
                    <article
                      key={idx}
                      className="rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] p-3"
                    >
                      {attr.isEditing ? (
                        <div className="space-y-3">
                          <input
                            value={attr.editName || ""}
                            onChange={(e) =>
                              onAttrEditNameChange?.(idx, e.target.value)
                            }
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
                              onAttrEditDataTypeChange?.(
                                idx,
                                e.target.value as DataType,
                              )
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
                              onAttrEditTypeChange?.(
                                idx,
                                e.target.value as AttributeType,
                              )
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
                                    onAttrEditRefTableChange?.(
                                      idx,
                                      e.target.value,
                                    );
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
                                  onChange={(e) =>
                                    onAttrEditRefAttrChange?.(
                                      idx,
                                      e.target.value,
                                    )
                                  }
                                  className={selectClass}
                                  disabled={!currentRefTable}
                                  title="Select reference attribute for foreign key"
                                >
                                  <option value="">Select attribute...</option>
                                  {currentRefTable &&
                                    getAvailableTables?.()
                                      .find(
                                        (table) =>
                                          table.label === currentRefTable,
                                      )
                                      ?.attributes?.map((refAttribute: any) => (
                                        <option
                                          key={refAttribute.name}
                                          value={refAttribute.name}
                                        >
                                          {refAttribute.name} (
                                          {refAttribute.dataType})
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
                                {attr.type === "FK" &&
                                attr.refTable &&
                                attr.refAttr
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
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm italic text-[#87867f]">
                No attributes defined yet.
              </p>
            )}
          </section>

          <section className={panelClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={labelClass}>Add attribute</p>
                <p className="mt-2 text-sm leading-6 text-[#5e5d59]">
                  Create a new field for the selected table.
                </p>
              </div>
              <span className="rounded-full border border-[#e8e6dc] bg-[#f5f4ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5d59]">
                New
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <input
                placeholder="Enter attribute name"
                value={attrName || ""}
                onChange={(e) => onAttrNameChange?.(e.target.value)}
                className={controlClass}
              />

              <select
                value={attrDataType || "VARCHAR"}
                onChange={(e) =>
                  onAttrDataTypeChange?.(e.target.value as DataType)
                }
                className={selectClass}
                title="Select data type for the attribute"
                aria-label="Data type selection"
              >
                {DATA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={attrType || "normal"}
                onChange={(e) =>
                  onAttrTypeChange?.(e.target.value as AttributeType)
                }
                className={selectClass}
                title="Select attribute type"
                aria-label="Attribute type selection"
              >
                <option value="normal">Normal</option>
                <option value="PK">Primary Key</option>
                <option value="FK">Foreign Key</option>
              </select>

              {attrType === "FK" && (
                <div className="space-y-3 rounded-2xl border border-[#e8e6dc] bg-[#f5f4ed] p-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#5e5d59]">
                      Reference Table
                    </label>
                    <select
                      value={refTable || ""}
                      onChange={(e) => {
                        onRefTableChange?.(e.target.value);
                        if (e.target.value !== refTable) {
                          onRefAttrChange?.("");
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
                      value={refAttr || ""}
                      onChange={(e) => onRefAttrChange?.(e.target.value)}
                      className={selectClass}
                      disabled={!refTable}
                      title="Select reference attribute for foreign key"
                    >
                      <option value="">Select attribute...</option>
                      {refTable &&
                        getAvailableTables?.()
                          .find((table) => table.label === refTable)
                          ?.attributes?.map((refAttribute: any) => (
                            <option
                              key={refAttribute.name}
                              value={refAttribute.name}
                            >
                              {refAttribute.name} ({refAttribute.dataType})
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={onAddAttribute}
                className="w-full rounded-full bg-[#c96442] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b95d3c]"
              >
                Add Attribute
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className={`${panelClass} mt-4 bg-[#f5f4ed] text-center`}>
          <div className="text-4xl">📊</div>
          <p className="mt-4 text-lg font-medium text-[#1F1F1E]">
            No Table Selected
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5e5d59]">
            Select a table node to view and edit its attributes.
          </p>
        </div>
      )}
    </aside>
  );
};
