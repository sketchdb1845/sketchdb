import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient, getAppSession, logoutAppSession } from "../lib/authClient";
import { deleteErProject, getErProjects } from "../lib/projectsApi";

interface ErProjectItem {
  id: string;
  name: string;
  erJson: string;
  updatedAt: string;
}

const ErDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ErProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const projectsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(projects.length / projectsPerPage));

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * projectsPerPage;
    return projects.slice(startIndex, startIndex + projectsPerPage);
  }, [projects, currentPage]);

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    const adjustedStart = Math.max(1, end - maxVisible + 1);

    return Array.from({ length: end - adjustedStart + 1 }, (_, idx) => adjustedStart + idx);
  }, [currentPage, totalPages]);

  useEffect(() => {
    const load = async () => {
      try {
        const session = await getAppSession();
        if (!session.user) {
          navigate("/auth?mode=signin");
          return;
        }

        const response = await getErProjects();
        setProjects(response.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (id: string) => {
    try {
      await deleteErProject(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } finally {
      await logoutAppSession();
      navigate("/auth?mode=signin");
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-x-hidden bg-[#f5f4ed] px-4 py-3 text-[#1F1F1E] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 border-b border-[#e8e6dc] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="mt-3 font-sans-claude text-4xl leading-none text-[#1F1F1E] sm:text-5xl">
                ER whiteboards, preserved as design canvases.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5e5d59] sm:text-lg">
                Each ER project is private to your account.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button
                onClick={() => navigate("/whiteboard")}
                className="rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                New ER project
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
            <span className="rounded-full bg-[#f0eee6] px-3 py-1.5">ER projects only</span>
            <span className="rounded-full bg-[#f0eee6] px-3 py-1.5">Per-user access</span>
            {!loading && projects.length > 0 && (
              <span className="rounded-full bg-[#f0eee6] px-3 py-1.5">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {loading && <p className="mt-6 text-[#5e5d59]">Loading projects...</p>}
          {error && <p className="mt-6 rounded-2xl border border-[#f1c7c7] bg-[#fdf4f4] px-4 py-3 text-sm text-[#b53333]">{error}</p>}

          {!loading && projects.length === 0 && (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#e8e6dc] bg-[#f5f4ed] p-8 text-center">
              <p className="font-sans-claude text-3xl text-[#1F1F1E]">No ER projects yet</p>
              <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-[#5e5d59]">
                Start your first whiteboard and it will appear here in your ER library.
              </p>
              <button
                onClick={() => navigate("/whiteboard")}
                className="mt-6 rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                Start with whiteboard
              </button>
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {paginatedProjects.map((project, index) => (
              <div key={project.id} className="group rounded-[1.6rem] border border-[#e8e6dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f5f4ed] px-3 py-1 text-xs font-medium text-[#5e5d59]">
                      <span className="h-2 w-2 rounded-full bg-[#c96442]" />
                      Project {(currentPage - 1) * projectsPerPage + index + 1}
                    </div>
                    <h2 className="font-sans-claude text-3xl leading-tight text-[#1F1F1E]">{project.name}</h2>
                    <p className="mt-2 text-sm text-[#87867f]">
                      Updated {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#f0eee6] bg-[#faf9f5] px-3 py-1 text-xs font-medium text-[#4d4c48]">
                    ER
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f0eee6] bg-[#f5f4ed] p-4 text-sm leading-6 text-[#5e5d59]">
                  ER diagram scene saved as structured Excalidraw JSON.
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/whiteboard?projectId=${project.id}`)}
                    className="rounded-full bg-[#1F1F1E] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#30302e]"
                  >
                    Open whiteboard
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

          {!loading && projects.length > projectsPerPage && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-[#e8e6dc] pt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    page === currentPage
                      ? "bg-[#c96442] text-[#faf9f5]"
                      : "border border-[#e8e6dc] bg-white text-[#4d4c48] hover:bg-[#f5f4ed]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErDashboard;
