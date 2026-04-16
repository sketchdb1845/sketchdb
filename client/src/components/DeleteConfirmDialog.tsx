import React from 'react';
import type { Node } from '@xyflow/react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  selectedTable: Node | undefined;
  selectedTableId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  selectedTable,
  selectedTableId,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const tableName =
    typeof selectedTable?.data.label === 'string'
      ? selectedTable.data.label
      : `Table ${selectedTableId}`;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#1F1F1E]/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
        <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">Danger zone</p>
        <h3 className="mt-3 font-serif-claude text-4xl leading-none text-[#1F1F1E]">Delete Table</h3>
        <p className="mt-4 text-sm leading-6 text-[#5e5d59]">Are you sure you want to delete "{tableName}"?</p>
        <p className="mt-2 text-sm text-[#87867f]">This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[#b53333] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f2a2a]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};