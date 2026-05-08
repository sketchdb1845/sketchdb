import { useMemo, useState } from "react";
import type { Collaborator } from "../lib/projectsApi";

type Props = {
  collaborators: Collaborator[];
  isOwner: boolean;
  publicAccess: "private" | "view";
  shareUrl: string;
  onAddCollaborator: (email: string, permission: "can_view" | "can_edit") => Promise<void>;
  onUpdateCollaborator: (id: string, permission: "can_view" | "can_edit") => Promise<void>;
  onRemoveCollaborator: (id: string) => Promise<void>;
  onUpdatePublicAccess: (access: "private" | "view") => Promise<void>;
};

export function CollaborationPanel({
  collaborators,
  isOwner,
  publicAccess,
  shareUrl,
  onAddCollaborator,
  onUpdateCollaborator,
  onRemoveCollaborator,
  onUpdatePublicAccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"can_view" | "can_edit">("can_edit");
  const [busy, setBusy] = useState(false);
  const collaboratorsLabel = useMemo(
    () => `${collaborators.length} collaborator${collaborators.length === 1 ? "" : "s"}`,
    [collaborators.length],
  );

  const handleAdd = async () => {
    if (!email.trim()) {
      return;
    }
    setBusy(true);
    try {
      await onAddCollaborator(email.trim(), permission);
      setEmail("");
    } finally {
      setBusy(false);
    }
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <section className="rounded-2xl border border-[#e8e6dc] bg-white p-3 text-sm text-[#4d4c48]">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#87867f]">Collaboration</p>
      <p className="mt-2 text-xs text-[#5e5d59]">{collaboratorsLabel}</p>

      {isOwner && (
        <div className="mt-3 grid grid-cols-1 gap-2">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Collaborator email"
            className="rounded-xl border border-[#e8e6dc] px-3 py-2 text-sm outline-none focus:border-[#3898ec]"
          />
          <div className="flex gap-2">
            <select
              value={permission}
              onChange={(event) => setPermission(event.target.value as "can_view" | "can_edit")}
              className="rounded-xl border border-[#e8e6dc] px-3 py-2"
            >
              <option value="can_edit">Can Edit</option>
              <option value="can_view">Can View</option>
            </select>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAdd()}
              className="rounded-xl border border-[#e8e6dc] bg-[#1F1F1E] px-3 py-2 text-[#faf9f5] disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 max-h-36 overflow-auto space-y-2">
        {collaborators.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-xl border border-[#f0eee6] px-2 py-1.5">
            <div>
              <p className="text-xs font-medium">{entry.name || entry.collaboratorEmail}</p>
              <p className="text-[11px] text-[#87867f]">{entry.status}</p>
            </div>
            {isOwner ? (
              <div className="flex items-center gap-1">
                <select
                  value={entry.permission}
                  onChange={(event) =>
                    void onUpdateCollaborator(entry.id, event.target.value as "can_view" | "can_edit")
                  }
                  className="rounded-lg border border-[#e8e6dc] px-2 py-1 text-xs"
                >
                  <option value="can_edit">Can Edit</option>
                  <option value="can_view">Can View</option>
                </select>
                <button
                  type="button"
                  onClick={() => void onRemoveCollaborator(entry.id)}
                  className="rounded-lg border border-[#e8e6dc] px-2 py-1 text-xs text-[#b53333]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <span className="text-xs">{entry.permission === "can_edit" ? "Can Edit" : "Can View"}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-[#f0eee6] p-2">
        <p className="text-xs font-medium">Public Sharing</p>
        <p className="text-[11px] text-[#87867f]">
          {publicAccess === "view" ? "Anyone with the link can view" : "Only collaborators can access"}
        </p>
        {isOwner && (
          <select
            value={publicAccess}
            onChange={(event) => void onUpdatePublicAccess(event.target.value as "private" | "view")}
            className="mt-2 w-full rounded-lg border border-[#e8e6dc] px-2 py-1 text-xs"
          >
            <option value="private">Private</option>
            <option value="view">Anyone with link can view</option>
          </select>
        )}
        <button
          type="button"
          onClick={() => void copyShareLink()}
          className="mt-2 rounded-lg border border-[#e8e6dc] px-2 py-1 text-xs"
        >
          Copy share link
        </button>
      </div>
    </section>
  );
}
