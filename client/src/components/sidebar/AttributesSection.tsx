import type { TableAttribute } from "../../types";
import { labelClass, panelClass } from "./styles";
import { AttributeCard } from "./AttributeCard";
import type { SidebarProps } from "./types";

interface AttributesSectionProps {
  attributes: TableAttribute[];
  getAvailableTables?: SidebarProps["getAvailableTables"];
  onStartAttrEdit?: SidebarProps["onStartAttrEdit"];
  onAttrEditNameChange?: SidebarProps["onAttrEditNameChange"];
  onAttrEditDataTypeChange?: SidebarProps["onAttrEditDataTypeChange"];
  onAttrEditTypeChange?: SidebarProps["onAttrEditTypeChange"];
  onAttrEditRefTableChange?: SidebarProps["onAttrEditRefTableChange"];
  onAttrEditRefAttrChange?: SidebarProps["onAttrEditRefAttrChange"];
  onSaveAttrName?: SidebarProps["onSaveAttrName"];
  onCancelAttrEdit?: SidebarProps["onCancelAttrEdit"];
  onDeleteAttribute?: SidebarProps["onDeleteAttribute"];
}

export function AttributesSection({
  attributes,
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
}: AttributesSectionProps) {
  return (
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
          {attributes.map((attr, idx) => (
            <AttributeCard
              key={idx}
              attr={attr}
              idx={idx}
              getAvailableTables={getAvailableTables}
              onStartAttrEdit={onStartAttrEdit}
              onAttrEditNameChange={onAttrEditNameChange}
              onAttrEditDataTypeChange={onAttrEditDataTypeChange}
              onAttrEditTypeChange={onAttrEditTypeChange}
              onAttrEditRefTableChange={onAttrEditRefTableChange}
              onAttrEditRefAttrChange={onAttrEditRefAttrChange}
              onSaveAttrName={onSaveAttrName}
              onCancelAttrEdit={onCancelAttrEdit}
              onDeleteAttribute={onDeleteAttribute}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm italic text-[#87867f]">No attributes defined yet.</p>
      )}
    </section>
  );
}