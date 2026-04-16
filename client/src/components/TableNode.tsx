import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { TableAttribute } from "../types";

interface TableNodeProps {
  data: {
    label: string;
    attributes: TableAttribute[];
    color?: string;
  };
  id: string;
}

export const TableNode: React.FC<TableNodeProps> = ({ data, id }) => {
  const attributes = Array.isArray(data.attributes) ? data.attributes : [];
  const tableColor = typeof data.color === "string" ? data.color : "#6b7280";
  const textColor = getReadableTextColor(tableColor);
  const tableRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    tableRef.current?.style.setProperty('--table-color', tableColor);
    tableRef.current?.style.setProperty('--table-text-color', textColor);
  }, [tableColor, textColor]);

  return (
    <div 
      ref={tableRef}
      className="min-w-[220px] overflow-hidden rounded-[1.5rem] border border-[var(--table-color)] bg-[#23233d] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
    >
      <div className="h-1.5 w-full bg-[var(--table-color)]" />

      {/* Table Header */}
      <div 
        className="px-4 py-4 text-center font-serif-claude text-lg font-semibold tracking-wide bg-[var(--table-color)] text-[var(--table-text-color)]"
      >
        {typeof data.label === "string" ? data.label : `Table ${id}`}
      </div>

      {/* Attributes List */}
      <div className="py-2">
        {attributes.length > 0 ? (
          attributes.map((attr, idx) => (
            <div
              key={idx}
              className={`relative flex min-h-[28px] items-center justify-between px-4 py-2 text-xs text-[#faf9f5] ${
                idx < attributes.length - 1 ? "border-b border-white/10" : ""
              } ${idx % 2 === 0 ? "bg-white/5" : ""}`}
            >
              {/* Left handle (incoming connections) */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-${attr.name}-target`}
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: attr.type === "FK" ? "#FF6B6B" : tableColor,
                  position: 'absolute',
                  left: -5,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  border: '2px solid #23233d'
                }}
              />

              {/* Right handle (outgoing connections) */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${attr.name}-source`}
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: attr.type === "PK" ? "#FFD700" : tableColor,
                  position: 'absolute',
                  right: -5,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  border: '2px solid #23233d'
                }}
              />

              <span className={`pr-3 ${attr.type === "PK" ? "font-semibold" : ""}`}>
                {attr.name}
                {attr.type === "PK" && (
                  <span className="ml-1 text-[#FFD700]">🔑</span>
                )}
                {attr.type === "FK" && (
                  <span className="ml-1 text-[#FF6B6B]">🔗</span>
                )}
              </span>

              <span className="text-[10px] text-[#b7b7c7]">
                {attr.dataType || "VARCHAR(255)"}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-xs italic text-[#b7b7c7]">
            No attributes
          </div>
        )}
      </div>
    </div>
  );
};

function getReadableTextColor(color: string) {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? "#111827" : "#ffffff";
}
