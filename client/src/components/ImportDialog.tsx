import React, { useState } from "react";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (sqlText: string) => void;
  onError: (error: any) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  onError,
}) => {
  const [sqlText, setSqlText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!sqlText.trim()) {
      onError(new Error("Please enter some SQL code to import"));
      return;
    }

    setIsLoading(true);
    try {
      await onImport(sqlText);
      setSqlText("");
      onClose();
    } catch (error) {
      console.error("Import failed:", error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSqlText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1F1F1E]/55 px-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#e8e6dc] pb-4">
          <div>
            <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">Import</p>
            <h2 className="mt-2 font-serif-claude text-4xl leading-none text-[#1F1F1E]">Import SQL Schema</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full border border-[#e8e6dc] bg-white px-3 py-2 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
          >
            Close
          </button>
        </div>

        <div className="mb-4 flex-1">
          <label className="mb-2 block font-medium text-[#1F1F1E]">
            Paste your SQL schema here:
          </label>
          <textarea
            value={sqlText}
            onChange={(e) => setSqlText(e.target.value)}
            placeholder="CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);"
            className="h-full min-h-[320px] w-full resize-y rounded-2xl border border-[#e8e6dc] bg-white p-4 font-mono text-sm text-[#1F1F1E] outline-none focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`rounded-full border border-[#e8e6dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#4d4c48] ${
              isLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-[#f5f4ed]"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!sqlText.trim() || isLoading}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold text-white ${
              !sqlText.trim() || isLoading
                ? "cursor-not-allowed bg-gray-400"
                : "cursor-pointer bg-[#c96442] hover:bg-[#b95d3c]"
            }`}
          >
            {isLoading ? "Importing..." : "Import Schema"}
          </button>
        </div>
      </div>
    </div>
  );
};
