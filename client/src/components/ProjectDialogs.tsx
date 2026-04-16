import React from "react";

interface ProjectNameDialogProps {
  isOpen: boolean;
  initialValue: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

interface NoticeDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const ProjectNameDialog: React.FC<ProjectNameDialogProps> = ({
  isOpen,
  initialValue,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = React.useState(initialValue);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialValue);
    }
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#1F1F1E]/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:p-8">
        <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">
          Save project
        </p>
        <h2 className="mt-3 font-serif-claude text-4xl leading-none text-[#1F1F1E]">
          Name this diagram
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#5e5d59]">
          Give this SQL schema a short title so it appears clearly in your project library.
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit(name.trim());
            }
          }}
          placeholder="Untitled Project"
          className="mt-6 w-full rounded-2xl border border-[#e8e6dc] bg-white px-4 py-3 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15"
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(name.trim())}
            className="rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
          >
            Save project
          </button>
        </div>
      </div>
    </div>
  );
};

export const NoticeDialog: React.FC<NoticeDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#1F1F1E]/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:p-8">
        <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">
          Project status
        </p>
        <h2 className="mt-3 font-serif-claude text-4xl leading-none text-[#1F1F1E]">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#5e5d59]">{message}</p>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-[#1F1F1E] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#30302e]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};