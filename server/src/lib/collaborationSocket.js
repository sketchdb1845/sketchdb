import { Server } from "socket.io";
import * as Y from "yjs";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { erProjects, sqlProjects } from "../db/schema.js";
import { verifySessionToken } from "./jwt.js";
import { parseCookieHeader } from "./cookies.js";
import { resolveProjectPermission } from "./collaboration.js";

const docs = new Map();

function getProjectTable(projectType) {
  return projectType === "er" ? erProjects : sqlProjects;
}

function getProjectPayloadField(projectType) {
  return projectType === "er" ? "erJson" : "sql";
}

async function getProjectWithOwner(projectType, projectId) {
  const table = getProjectTable(projectType);
  const rows = await db.select().from(table).where(eq(table.id, projectId)).limit(1);
  return rows[0] || null;
}

function getOrCreateDoc(roomKey) {
  let state = docs.get(roomKey);
  if (!state) {
    state = { doc: new Y.Doc() };
    docs.set(roomKey, state);
  }
  return state;
}

export function attachCollaborationSocket(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie || "");
      const token = cookies.sketchdb_session || "";
      if (!token) {
        socket.data.user = null;
        return next();
      }
      const decoded = verifySessionToken(token);
      socket.data.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };
      return next();
    } catch {
      socket.data.user = null;
      return next();
    }
  });

  io.on("connection", (socket) => {
    socket.on("collab:join", async (payload, ack) => {
      try {
        const projectType = payload?.projectType;
        const projectId = payload?.projectId;
        if (!projectType || !projectId || !["sql", "er"].includes(projectType)) {
          ack?.({ ok: false, message: "Invalid room payload" });
          return;
        }

        const project = await getProjectWithOwner(projectType, projectId);
        if (!project) {
          ack?.({ ok: false, message: "Project not found" });
          return;
        }

        const permission = await resolveProjectPermission(projectType, project, socket.data.user);
        if (permission.access === "none") {
          ack?.({ ok: false, message: "Unauthorized" });
          return;
        }

        const roomKey = `${projectType}:${projectId}`;
        socket.join(roomKey);
        socket.data.roomKey = roomKey;
        socket.data.permission = permission;

        const docState = getOrCreateDoc(roomKey);
        const ydoc = docState.doc;
        const yText = ydoc.getText("content");
        if (!yText.length) {
          const field = getProjectPayloadField(projectType);
          const initialValue = project[field] || "";
          if (initialValue) {
            ydoc.transact(() => {
              yText.insert(0, initialValue);
            }, "bootstrap");
          }
        }

        const stateUpdate = Y.encodeStateAsUpdate(ydoc);
        ack?.({
          ok: true,
          access: permission.access,
          user: socket.data.user || null,
          state: Array.from(stateUpdate),
        });
      } catch (error) {
        ack?.({ ok: false, message: "Failed to join room" });
      }
    });

    socket.on("collab:update", (payload) => {
      const roomKey = socket.data.roomKey;
      if (!roomKey || socket.data.permission?.access !== "edit") {
        return;
      }
      const update = payload?.update;
      if (!Array.isArray(update)) {
        return;
      }
      const docState = getOrCreateDoc(roomKey);
      const ydoc = docState.doc;
      const updateBuffer = Uint8Array.from(update);
      Y.applyUpdate(ydoc, updateBuffer, socket.id);
      socket.to(roomKey).emit("collab:update", { update });
    });

    socket.on("collab:awareness", (payload) => {
      const roomKey = socket.data.roomKey;
      if (!roomKey) {
        return;
      }
      socket.to(roomKey).emit("collab:awareness", {
        ...payload,
        socketId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      if (socket.data.roomKey) {
        socket.to(socket.data.roomKey).emit("collab:awareness:leave", {
          socketId: socket.id,
        });
      }
    });
  });
}
