import { Excalidraw, exportToBlob, serializeAsJSON } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DatabaseBackup } from "lucide-react";
import { createErProject, getErProjectById, updateErProject } from "../lib/projectsApi";

type ExcalidrawApiLike = {
  getSceneElements: () => readonly any[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
  updateScene: (scene: {
    elements?: any[];
    appState?: Record<string, unknown>;
  }) => void;
};

type SerializedScene = {
  elements: any[];
  appState: Record<string, unknown>;
  files: any;
};

const randomSeed = () => Math.floor(Math.random() * 2147483647);

const nameInputClass =
  "w-full rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15";

const blankScene: SerializedScene = {
  elements: [],
  appState: {
    theme: "dark" as const,
    viewBackgroundColor: "transparent",
    currentItemStrokeColor: "#000",
    currentItemBackgroundColor: "transparent",
  },
  files: {},
};

const createBaseElement = (
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeStyle: "solid" | "dashed" = "solid",
) => ({
  id: `er-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  x,
  y,
  width,
  height,
  angle: 0,
  strokeColor: "#000",
  backgroundColor: "transparent",
  fillStyle: "hachure",
  strokeWidth: 2,
  strokeStyle,
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: null,
  seed: randomSeed(),
  version: 1,
  versionNonce: randomSeed(),
  isDeleted: false,
  boundElements: null,
  updated: Date.now(),
  link: null,
  locked: false,
});

const createTextElement = (text: string, x: number, y: number) => ({
  id: `er-label-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: "text",
  x,
  y,
  width: Math.max(80, text.length * 9),
  height: 24,
  angle: 0,
  strokeColor: "#000",
  backgroundColor: "transparent",
  fillStyle: "solid",
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 0,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: null,
  seed: randomSeed(),
  version: 1,
  versionNonce: randomSeed(),
  isDeleted: false,
  boundElements: null,
  updated: Date.now(),
  link: null,
  locked: false,
  text,
  fontSize: 20,
  fontFamily: 1,
  textAlign: "center",
  verticalAlign: "middle",
  baseline: 18,
  containerId: null,
  originalText: text,
  lineHeight: 1.2,
});

const WhiteBoard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawApiLike | null>(
    null,
  );
  const [sceneData, setSceneData] = useState<SerializedScene>(blankScene);
  const [sceneKey, setSceneKey] = useState("whiteboard-blank");
  const [projectName, setProjectName] = useState("Untitled ER diagram");
  const [savedProjectName, setSavedProjectName] = useState("Untitled ER diagram");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const projectId = searchParams.get("projectId") || "";

  const initialData = useMemo(() => sceneData, [sceneData]);

  const fileNameBase = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    || "er-diagram";

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      if (!projectId) {
        setProjectName("Untitled ER diagram");
        setSavedProjectName("Untitled ER diagram");
        setSceneData(blankScene);
        setSceneKey("whiteboard-blank");
        setStatusMessage("");
        setErrorMessage("");
        return;
      }

      setIsLoadingProject(true);
      setErrorMessage("");
      setStatusMessage("Loading project...");

      try {
        const response = await getErProjectById(projectId);
        const project = response.project;

        const parsedScene = project.erJson ? JSON.parse(project.erJson) : null;
        const normalizedScene: SerializedScene = parsedScene
          ? {
              elements: Array.isArray(parsedScene.elements) ? parsedScene.elements : [],
              appState: {
                ...blankScene.appState,
                ...(parsedScene.appState || {}),
              },
              files: parsedScene.files || {},
            }
          : blankScene;
        if (cancelled) {
          return;
        }

        setProjectName(project.name);
  setSavedProjectName(project.name);
        setSceneData(normalizedScene);
        setSceneKey(`whiteboard-${project.id}`);
        setStatusMessage("Project loaded");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load project");
          setStatusMessage("");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProject(false);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [navigate, projectId]);

  const addPreset = (elementsToAdd: any[]) => {
    if (!excalidrawApi) {
      return;
    }

    const currentElements = Array.from(excalidrawApi.getSceneElements() || []);
    excalidrawApi.updateScene({
      elements: [...currentElements, ...elementsToAdd],
    });
  };

  const getSerializedScene = () => {
    if (!excalidrawApi) {
      throw new Error("Canvas is not ready yet");
    }

    const elements = Array.from(excalidrawApi.getSceneElements() || []);
    const appState = {
      ...excalidrawApi.getAppState(),
      viewBackgroundColor: "transparent",
    };
    const files = excalidrawApi.getFiles() || {};

    return {
      elements,
      appState,
      files,
      serialized: serializeAsJSON(elements, appState, files as any, "database"),
    } as const;
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const commitProjectName = async () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setProjectName(savedProjectName);
      setErrorMessage("Project name is required");
      return;
    }

    if (!projectId) {
      setProjectName(trimmedName);
      setSavedProjectName(trimmedName);
      return;
    }

    if (trimmedName === savedProjectName) {
      return;
    }

    try {
      setErrorMessage("");
      const response = await updateErProject(projectId, { name: trimmedName });
      setProjectName(response.project.name);
      setSavedProjectName(response.project.name);
      setStatusMessage("Project name updated");
    } catch (error) {
      setProjectName(savedProjectName);
      setErrorMessage(error instanceof Error ? error.message : "Failed to update project name");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage("");

      const scene = getSerializedScene();
      const nextScene = {
        elements: scene.elements,
        appState: scene.appState,
        files: scene.files as any,
      };
      const trimmedName = projectName.trim() || "Untitled ER diagram";

      if (projectId) {
        const response = await updateErProject(projectId, {
          name: trimmedName,
          erJson: scene.serialized,
        });

        setProjectName(response.project.name);
      } else {
        const response = await createErProject(trimmedName, scene.serialized);

        setSearchParams({ projectId: response.project.id });
        setProjectName(response.project.name);
      }

      setSceneData(nextScene);
      setSceneKey(projectId ? `whiteboard-${projectId}` : `whiteboard-new-${Date.now()}`);
      setStatusMessage("Saved to library");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save project");
      setStatusMessage("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setErrorMessage("");
      setStatusMessage("Preparing export...");

      const scene = getSerializedScene();
      const exportName = fileNameBase;

      downloadBlob(
        new Blob([scene.serialized], { type: "application/json" }),
        `${exportName}.excalidraw.json`,
      );

      const pngBlob = await exportToBlob({
        elements: scene.elements,
        appState: {
          ...scene.appState,
          viewBackgroundColor: "#1F1F1E",
        },
        files: scene.files,
        mimeType: "image/png",
        exportPadding: 32,
      });

      downloadBlob(pngBlob, `${exportName}.png`);
      setStatusMessage("Exported PNG and JSON");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to export project");
      setStatusMessage("");
    } finally {
      setIsExporting(false);
    }
  };

  const placeEntity = () => {
    addPreset([
      createBaseElement("rectangle", 240, 180, 220, 110),
      createTextElement("Entity", 305, 222),
    ]);
  };

  const placeAttribute = () => {
    addPreset([
      createBaseElement("ellipse", 260, 220, 180, 90),
      createTextElement("Attribute", 305, 252),
    ]);
  };

  const placeRelationship = () => {
    addPreset([
      createBaseElement("diamond", 270, 200, 160, 95),
      createTextElement("Relationship", 292, 233),
    ]);
  };

  const placeWeakEntity = () => {
    addPreset([
      createBaseElement("rectangle", 230, 170, 260, 130),
      createBaseElement("rectangle", 245, 185, 230, 100),
      createTextElement("Weak Entity", 292, 223),
    ]);
  };

  const placeDerivedAttribute = () => {
    addPreset([
      createBaseElement("ellipse", 260, 220, 190, 90, "dashed"),
      createTextElement("Derived", 315, 252),
    ]);
  };

  const placeMultiValuedAttribute = () => {
    addPreset([
      createBaseElement("ellipse", 250, 205, 210, 100),
      createBaseElement("ellipse", 263, 218, 184, 74),
      createTextElement("Multi-valued", 292, 246),
    ]);
  };

  const placeCompositeAttribute = () => {
    const parent = createBaseElement("ellipse", 260, 200, 200, 95);
    const childA = createBaseElement("ellipse", 120, 340, 150, 70);
    const childB = createBaseElement("ellipse", 320, 340, 150, 70);
    const linkA = createBaseElement("line", 258, 294, -65, 55);
    const linkB = createBaseElement("line", 400, 294, -5, 55);

    addPreset([
      parent,
      childA,
      childB,
      linkA,
      linkB,
      createTextElement("Composite", 316, 232),
      createTextElement("Part A", 158, 365),
      createTextElement("Part B", 358, 365),
    ]);
  };

  return (
    <div className="er-whiteboard flex h-screen w-screen overflow-hidden bg-[#f5f4ed] text-[#1F1F1E]">
      <style>{`
        .er-whiteboard .canvas-board {
          background:
            radial-gradient(circle at bottom left, rgba(255, 255, 255, 0), transparent 26%),
            radial-gradient(circle, rgba(255, 255, 255, 0.12) 1.6px, transparent 1.5px),
            #1F1F1E;
          background-size: auto, 14px 14px, auto;
          background-position: center, 0 0, center;
        }

        .er-whiteboard .canvas-board .excalidraw.theme--dark {
          background: transparent !important;
        }

        .er-whiteboard .canvas-board .excalidraw .App-menu,
        .er-whiteboard .canvas-board .excalidraw canvas {
          background: transparent !important;
        }

        .er-whiteboard .excalidraw .main-menu-trigger {
          display: none !important;
        }

        .er-whiteboard .excalidraw .layer-ui__wrapper__top-right {
          display: none !important;
        }

        .er-whiteboard .excalidraw .layer-ui__wrapper__footer-right {
          display: none !important;
        }
      `}</style>
      <aside className="w-[25rem] shrink-0 overflow-y-auto border-r border-[#e8e6dc] bg-[#faf9f5] px-4 py-5 text-[#1F1F1E] shadow-[0_16px_50px_rgba(0,0,0,0.06)] lg:px-5">
        <div className="mb-5 rounded-[1.5rem] border border-[#e8e6dc] bg-[#faf9f5]/95 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e6dc] bg-white text-[#4d4c48] transition hover:bg-[#f5f4ed]"
              onClick={() => navigate("/er-dashboard")}
              aria-label="Back to ER dashboard"
            >
              <DatabaseBackup className="h-5 w-5" />
            </button>
            <div className="text-right">
              <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">Inspector</p>
              <h3 className="mt-1 font-serif-claude text-2xl leading-none text-[#1F1F1E]">ER Attributes</h3>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-[#e8e6dc] bg-white px-3 py-3">
            <label className="text-[10px] uppercase tracking-[0.35em] text-[#87867f]" htmlFor="er-project-name">
              Project name
            </label>
            <input
              id="er-project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              onBlur={() => {
                void commitProjectName();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
              className={`mt-2 ${nameInputClass}`}
              placeholder="Untitled ER diagram"
            />
          </div>
        </div>

        <section className="rounded-[1.5rem] border border-[#e8e6dc] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">ER Presets</p>
          <h2 className="mt-2 font-sans-claude text-3xl leading-none text-[#1F1F1E]">Shapes</h2>
          <p className="mt-3 text-sm leading-6 text-[#5e5d59]">
            Use starter blocks from the ER notation set, then connect and rename directly in canvas.
          </p>

          <div className="mt-4 grid gap-2">
            <button onClick={placeEntity} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Entity (Rectangle)</button>
            <button onClick={placeAttribute} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Attribute (Ellipse)</button>
            <button onClick={placeRelationship} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Relationship (Diamond)</button>
            <button onClick={placeWeakEntity} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Weak Entity (Double Rectangle)</button>
            <button onClick={placeDerivedAttribute} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Derived Attribute (Dashed Ellipse)</button>
            <button onClick={placeMultiValuedAttribute} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Multi-valued Attribute (Double Ellipse)</button>
            <button onClick={placeCompositeAttribute} className="rounded-2xl border border-[#e8e6dc] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Composite Attribute</button>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={() => navigate("/er-dashboard")} className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]">Back</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoadingProject || isSaving || isExporting}
              className="rounded-full border border-[#e8e6dc] bg-[#B95D3C] px-4 py-2 text-sm font-medium text-[#faf9f5] transition hover:bg-[#30302e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isLoadingProject || isSaving || isExporting}
              className="rounded-full border border-[#e8e6dc] bg-[#B95D3C] px-4 py-2 text-sm font-medium text-[#faf9f5] transition hover:bg-[#30302e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? "Exporting..." : "Export"}
            </button>
          </div>

          {/* <div className="mt-4 space-y-2 text-sm text-[#5e5d59]">
            {statusMessage && <p>{statusMessage}</p>}
            {errorMessage && <p className="rounded-2xl border border-[#f1c7c7] bg-[#fdf4f4] px-3 py-2 text-[#b53333]">{errorMessage}</p>}
          </div> */}
        </section>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#1F1F1E]">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_26%)]" />

          <div className="canvas-board h-full w-full overflow-hidden">
            <Excalidraw
              key={sceneKey}
              theme="dark"
              initialData={initialData}
              excalidrawAPI={(api) =>
                setExcalidrawApi(api as unknown as ExcalidrawApiLike)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteBoard;
