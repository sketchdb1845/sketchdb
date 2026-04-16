import React from 'react';

interface ErrorDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  title,
  message,
  details,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#1F1F1E]/55 px-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-[540px] flex-col rounded-[2rem] border border-[#f1c7c7] bg-[#faf9f5] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
        <div className="mb-4 flex items-center border-b border-[#f1dede] pb-3">
          <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#b53333] text-sm font-bold text-white">
            !
          </div>
          <h2 className="m-0 text-lg font-semibold text-[#b53333]">
            {title}
          </h2>
        </div>
        
        <div className="mb-4">
          <p className="m-0 text-sm leading-6 text-[#5e5d59]">
            {message}
          </p>
        </div>

        {/* Error Details */}
        {details && (
          <div className="mb-5">
            <details className="cursor-pointer">
              <summary className="mb-2 text-xs font-medium text-[#87867f] outline-none">
                Show Error Details
              </summary>
              <div className="max-h-[150px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[#e8e6dc] bg-white p-3 font-mono text-xs text-[#1F1F1E]">
                {details}
              </div>
            </details>
          </div>
        )}

        <div className="mt-auto flex justify-end gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="cursor-pointer rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#b53333] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#9f2a2a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};