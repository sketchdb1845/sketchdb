import React from 'react';

interface SQLDialogProps {
  isOpen: boolean;
  sqlText: string;
  onClose: () => void;
  onCopy: () => void;
}

export const SQLDialog: React.FC<SQLDialogProps> = ({
  isOpen,
  sqlText,
  onClose,
  onCopy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#1F1F1E]/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e8e6dc] pb-4">
          <div>
            <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">Export</p>
            <h2 className="mt-2 font-serif-claude text-4xl leading-none text-[#1F1F1E]">Exported SQL</h2>
          </div>
        </div>

        <textarea
          value={sqlText}
          readOnly
          aria-label="Generated SQL code"
          title="Generated SQL code for the database schema"
          className="mt-5 w-full min-h-[240px] max-h-[500px] resize-none rounded-2xl border border-[#e8e6dc] bg-white p-4 font-mono text-sm text-[#1F1F1E] outline-none"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCopy}
            className="rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
          >
            Copy
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};