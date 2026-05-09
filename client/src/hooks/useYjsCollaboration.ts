import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { io } from "socket.io-client";
import { appApiBaseUrl } from "../lib/authClient";

type PresenceUser = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
};

const palette = ["#c96442", "#4f9d69", "#6e56cf", "#ec6a5e", "#2f80ed", "#cc3d7f"];

function hashColor(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

export function useYjsCollaboration({
  projectType,
  projectId,
  canEdit,
  user,
  onRemoteValue,
}: {
  projectType: "sql" | "er";
  projectId: string;
  canEdit: boolean;
  user: { id?: string; name?: string | null; email?: string | null } | null;
  onRemoteValue: (nextValue: string) => void;
}) {
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const isApplyingRemote = useRef(false);
  const onRemoteValueRef = useRef(onRemoteValue);

  useEffect(() => {
    onRemoteValueRef.current = onRemoteValue;
  }, [onRemoteValue]);

  const selfUser = useMemo(() => {
    const id = user?.id || user?.email || `guest-${Math.random().toString(36).slice(2, 9)}`;
    const name = user?.name || user?.email || "Guest";
    return { id, name, color: hashColor(id) };
  }, [user?.email, user?.id, user?.name]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const doc = new Y.Doc();
    const yText = doc.getText("content");
    docRef.current = doc;
    yTextRef.current = yText;

    const socket = io(appApiBaseUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    yText.observe((event) => {
      if (isApplyingRemote.current) {
        return;
      }
      // Local `pushValue` updates must not call `onRemoteValue`: consumers re-import
      // the full document (e.g. SQL canvas `importNodes` clears selection; Excalidraw
      // would get an extra `updateScene`), which feels like the diagram resets.
      if (event.transaction.local) {
        return;
      }
      onRemoteValueRef.current(yText.toString());
    });

    const onRemoteUpdate = (payload: { update: number[] }) => {
      if (!payload?.update) {
        return;
      }
      isApplyingRemote.current = true;
      Y.applyUpdate(doc, Uint8Array.from(payload.update), "remote");
      onRemoteValueRef.current(yText.toString());
      isApplyingRemote.current = false;
    };

    const onAwareness = (payload: PresenceUser & { socketId: string }) => {
      setPresence((prev) => {
        const filtered = prev.filter((entry) => entry.id !== payload.id);
        return [...filtered, payload];
      });
    };

    const onAwarenessLeave = (payload: { socketId: string }) => {
      if (!payload?.socketId) {
        return;
      }
      setPresence((prev) => prev.filter((entry) => entry.id !== payload.socketId));
    };

    socket.on("connect", () => {
      socket.emit("collab:join", { projectType, projectId }, (response: any) => {
        if (!response?.ok) {
          return;
        }
        setConnected(true);
        if (Array.isArray(response.state)) {
          isApplyingRemote.current = true;
          Y.applyUpdate(doc, Uint8Array.from(response.state), "bootstrap");
          onRemoteValueRef.current(yText.toString());
          isApplyingRemote.current = false;
        }
      });
    });
    socket.on("collab:update", onRemoteUpdate);
    socket.on("collab:awareness", onAwareness);
    socket.on("collab:awareness:leave", onAwarenessLeave);

    return () => {
      socket.off("collab:update", onRemoteUpdate);
      socket.off("collab:awareness", onAwareness);
      socket.off("collab:awareness:leave", onAwarenessLeave);
      socket.disconnect();
      doc.destroy();
      docRef.current = null;
      yTextRef.current = null;
      socketRef.current = null;
      setPresence([]);
      setConnected(false);
    };
  }, [projectId, projectType]);

  const pushValue = useCallback((value: string) => {
    const yText = yTextRef.current;
    const socket = socketRef.current;
    const doc = docRef.current;
    if (!yText || !socket || !doc || !connected || !canEdit) {
      return;
    }
    if (yText.toString() === value) {
      return;
    }
    doc.transact(() => {
      yText.delete(0, yText.length);
      yText.insert(0, value);
    }, "local-change");
    const update = Y.encodeStateAsUpdate(doc);
    socket.emit("collab:update", { update: Array.from(update) });
  }, [canEdit, connected]);

  const sendCursor = useCallback((x: number, y: number) => {
    const socket = socketRef.current;
    if (!socket || !connected) {
      return;
    }
    socket.emit("collab:awareness", {
      id: socket.id,
      name: selfUser.name,
      color: selfUser.color,
      x,
      y,
    });
  }, [connected, selfUser.color, selfUser.name]);

  return {
    connected,
    presence,
    pushValue,
    sendCursor,
  };
}
