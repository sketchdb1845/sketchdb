import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/authClient";
import { deleteProject, getProjects } from "../lib/projectsApi";

interface ProjectItem {
  id: string;
  name: string;
  sql: string;
  updatedAt: string;
}

const DashBoard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          navigate("/auth?mode=signin");
          return;
        }

        const response = await getProjects();
        setProjects(response.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f4ed] px-4 py-6 text-[#1F1F1E] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 border-b border-[#e8e6dc] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">
                Your library
              </p>
              <h1 className="mt-3 font-sans-claude text-4xl leading-none text-[#1F1F1E] sm:text-5xl">
                Saved diagrams, held together by SQL.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5e5d59] sm:text-lg">
                Each project is private to your account. Open a diagram, revise the schema, or start fresh from the playground.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button
                onClick={() => navigate("/playground")}
                className="rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                New project
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#5e5d59]">
            <span className="rounded-full bg-[#e8e6dc] px-3 py-1.5">{projects.length} project{projects.length === 1 ? "" : "s"}</span>
            <span className="rounded-full bg-[#f0eee6] px-3 py-1.5">SQL stored only</span>
            <span className="rounded-full bg-[#f0eee6] px-3 py-1.5">Per-user access</span>
          </div>

          {loading && <p className="mt-6 text-[#5e5d59]">Loading projects...</p>}
          {error && <p className="mt-6 rounded-2xl border border-[#f1c7c7] bg-[#fdf4f4] px-4 py-3 text-sm text-[#b53333]">{error}</p>}

          {!loading && projects.length === 0 && (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#e8e6dc] bg-[#f5f4ed] p-8 text-center">
              <p className="font-sans-claude text-3xl text-[#1F1F1E]">Nothing here yet</p>
              <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-[#5e5d59]">
                Create your first schema project and it will appear here as a quiet, private entry in your library.
              </p>
              <button
                onClick={() => navigate("/playground")}
                className="mt-6 rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                Start a project
              </button>
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <div key={project.id} className="group rounded-[1.6rem] border border-[#e8e6dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f5f4ed] px-3 py-1 text-xs font-medium text-[#5e5d59]">
                      <span className="h-2 w-2 rounded-full bg-[#c96442]" />
                      Project {index + 1}
                    </div>
                    <h2 className="font-sans-claude text-3xl leading-tight text-[#1F1F1E]">{project.name}</h2>
                    <p className="mt-2 text-sm text-[#87867f]">
                      Updated {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#f0eee6] bg-[#faf9f5] px-3 py-1 text-xs font-medium text-[#4d4c48]">
                    SQL
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f0eee6] bg-[#f5f4ed] p-4 text-sm leading-6 text-[#5e5d59]">
                  {project.sql.slice(0, 160)}{project.sql.length > 160 ? "..." : ""}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/playground?projectId=${project.id}`)}
                    className="rounded-full bg-[#1F1F1E] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#30302e]"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#b53333] transition hover:bg-[#fdf4f4]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
