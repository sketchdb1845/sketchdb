import type { AttributeType, DataType } from "../../types";
import { DATA_TYPES } from "../../types";
import { controlClass, labelClass, panelClass, selectClass } from "./styles";
import type { SidebarProps } from "./types";

interface AddAttributeSectionProps {
  attrName: string;
  attrType: AttributeType;
  attrDataType: DataType;
  refTable: string;
  refAttr: string;
  onAttrNameChange?: SidebarProps["onAttrNameChange"];
  onAttrDataTypeChange?: SidebarProps["onAttrDataTypeChange"];
  onAttrTypeChange?: SidebarProps["onAttrTypeChange"];
  onRefTableChange?: SidebarProps["onRefTableChange"];
  onRefAttrChange?: SidebarProps["onRefAttrChange"];
  onAddAttribute?: SidebarProps["onAddAttribute"];
  getAvailableTables?: SidebarProps["getAvailableTables"];
}

export function AddAttributeSection({
  attrName,
  attrType,
  attrDataType,
  refTable,
  refAttr,
  onAttrNameChange,
  onAttrDataTypeChange,
  onAttrTypeChange,
  onRefTableChange,
  onRefAttrChange,
  onAddAttribute,
  getAvailableTables,
}: AddAttributeSectionProps) {
  return (
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
          onChange={(e) => onAttrDataTypeChange?.(e.target.value as DataType)}
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
          onChange={(e) => onAttrTypeChange?.(e.target.value as AttributeType)}
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
                    ?.attributes?.map((refAttribute) => (
                      <option key={refAttribute.name} value={refAttribute.name}>
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
  );
}