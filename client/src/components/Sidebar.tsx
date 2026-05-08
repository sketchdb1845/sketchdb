import React from "react";
import { useNavigate } from "react-router-dom";
import { TABLE_COLOR_OPTIONS } from "../types";
import { AddAttributeSection } from "./sidebar/AddAttributeSection";
import { AttributesSection } from "./sidebar/AttributesSection";
import { EmptySelectionState } from "./sidebar/EmptySelectionState";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { TableColorSection } from "./sidebar/TableColorSection";
import { TableDetailsSection } from "./sidebar/TableDetailsSection";
import type { SidebarProps } from "./sidebar/types";

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
  collaborationPanel,
}) => {
  const navigate = useNavigate();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<"inspector" | "collaborators">("inspector");
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
      <SidebarHeader onGoHome={() => navigate("/")} />
      <div className="mb-4 rounded-2xl border border-[#e8e6dc] bg-white p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("inspector")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              activeTab === "inspector"
                ? "bg-[#B95D3C] text-[#faf9f5]"
                : "bg-transparent text-[#4d4c48] hover:bg-[#f5f4ed]"
            }`}
          >
            Inspector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("collaborators")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              activeTab === "collaborators"
                ? "bg-[#B95D3C] text-[#faf9f5]"
                : "bg-transparent text-[#4d4c48] hover:bg-[#f5f4ed]"
            }`}
          >
            Collaborators
          </button>
        </div>
      </div>

      {activeTab === "collaborators" ? (
        collaborationPanel ? (
          <div>{collaborationPanel}</div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#e8e6dc] bg-white p-5 text-sm text-[#5e5d59]">
            Collaboration options appear after opening a saved project.
          </div>
        )
      ) : selectedTable ? (
        <div className="space-y-4">
          <TableDetailsSection
            selectedTableLabel={selectedTableLabel}
            isEditingTableName={isEditingTableName}
            editTableName={editTableName}
            onStartEditTableName={onStartEditTableName}
            onSaveTableName={onSaveTableName}
            onCancelEditTableName={onCancelEditTableName}
            onEditTableNameChange={onEditTableNameChange}
            onDeleteTable={onDeleteTable}
          />

          <TableColorSection
            currentTableColor={currentTableColor}
            onTableColorChange={onTableColorChange}
          />

          <AttributesSection
            attributes={attributes}
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

          <AddAttributeSection
            attrName={attrName}
            attrType={attrType}
            attrDataType={attrDataType}
            refTable={refTable}
            refAttr={refAttr}
            onAttrNameChange={onAttrNameChange}
            onAttrDataTypeChange={onAttrDataTypeChange}
            onAttrTypeChange={onAttrTypeChange}
            onRefTableChange={onRefTableChange}
            onRefAttrChange={onRefAttrChange}
            onAddAttribute={onAddAttribute}
            getAvailableTables={getAvailableTables}
          />
        </div>
      ) : (
        <EmptySelectionState />
      )}
    </aside>
  );
};
