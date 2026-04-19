import type { Node } from "@xyflow/react";
import type { AttributeType, DataType, TableAttribute } from "../../types";

export interface AvailableTableAttribute {
  name: string;
  dataType: string;
}

export interface AvailableTable {
  id: string;
  label: string;
  attributes: AvailableTableAttribute[];
}

export interface SidebarProps {
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
  getAvailableTables?: () => AvailableTable[];
}