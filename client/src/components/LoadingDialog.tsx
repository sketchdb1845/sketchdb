import React from 'react';

interface LoadingDialogProps {
  isOpen: boolean;
  message?: string;
  onCancel?: () => void;
}

export const LoadingDialog: React.FC<LoadingDialogProps> = ({
  isOpen,
  message = "Parsing to SQL...",
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#1F1F1E]/50 px-4 backdrop-blur-sm">
      <div className="min-w-[420px] rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
        <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-[#e8e6dc] border-t-[#c96442]" />
        <h3 className="font-serif-claude text-3xl text-[#1F1F1E]">
        {message}
        </h3>
        <p className={`mt-3 text-sm text-[#5e5d59] ${onCancel ? "mb-6" : "mb-0"}`}>
          Please wait while we process your request.
        </p>

        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};