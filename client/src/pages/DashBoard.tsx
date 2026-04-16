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
    <div className="min-h-screen bg-[#0b1220] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My SQL Projects</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/playground")}
              className="px-4 py-2 rounded-md bg-[#1d4ed8] hover:bg-[#1e40af]"
            >
              New Project
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-md bg-[#334155] hover:bg-[#1e293b]"
            >
              Sign Out
            </button>
          </div>
        </div>

        {loading && <p>Loading projects...</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!loading && projects.length === 0 && (
          <p className="text-gray-300">No projects yet. Create one from the playground.</p>
        )}

        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border border-[#1f2c47] bg-[#101a2d] rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <p className="text-sm text-gray-400">
                    Updated {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/playground?projectId=${project.id}`)}
                    className="px-3 py-2 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8]"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-2 rounded-md bg-[#dc2626] hover:bg-[#b91c1c]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
