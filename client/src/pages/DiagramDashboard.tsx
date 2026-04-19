import { useNavigate } from "react-router-dom";
import { authClient, logoutAppSession } from "../lib/authClient";

const DiagramDashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } finally {
      await logoutAppSession();
      navigate("/auth?mode=signin");
    }
  };

  return (
    <section className="min-h-screen bg-[#f5f4ed] px-4 py-6 text-[#1F1F1E] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1200px] rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e8e6dc] pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#87867f]">
              Dashboard
            </p>
            <h1 className="mt-2 font-sans-claude text-4xl leading-none text-[#1F1F1E] sm:text-5xl">
              Choose your diagram workspace
            </h1>
            <p className="mt-3 max-w-2xl text-[#5e5d59]">
              Split your flow by intent: SQL schema management in one lane and
              ER whiteboarding in another.
            </p>
          </div>

          <div className="flex flex-row gap-2">
            <button
              onClick={() => navigate("/")}
              className="rounded-full bg-[#c96442] px-5 py-3 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
            >
              Home
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-[#e8e6dc] bg-white px-5 py-3 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.6rem] border border-[#e8e6dc] bg-white p-6">
            <span className="inline-flex rounded-full bg-[#f5f4ed] px-3 py-1 text-xs font-medium text-[#5e5d59]">
              Schema
            </span>
            <h2 className="mt-4 font-sans-claude text-3xl text-[#1F1F1E]">
              Schema Dashboard
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5e5d59]">
              Browse and manage SQL-backed projects, open canvas editor, and
              keep schema revisions organized.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/schema-dashboard")}
                className="rounded-full bg-[#c96442] px-5 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                Open schema dashboard
              </button>
              <button
                onClick={() => navigate("/playground")}
                className="rounded-full border border-[#e8e6dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
              >
                New SQL project
              </button>
            </div>
          </article>

          <article className="rounded-[1.6rem] border border-[#e8e6dc] bg-white p-6">
            <span className="inline-flex rounded-full bg-[#f5f4ed] px-3 py-1 text-xs font-medium text-[#5e5d59]">
              Entity RelationShip
            </span>
            <h2 className="mt-4 font-sans-claude text-3xl text-[#1F1F1E]">
              ER Whiteboard
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5e5d59]">
              Sketch entity relationships quickly with ER-specific presets:
              entities, attributes, relationships, and more.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/er-dashboard")}
                className="rounded-full bg-[#c96442] px-5 py-2.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                Open ER dashboard
              </button>
              <button
                onClick={() => navigate("/whiteboard")}
                className="rounded-full border border-[#e8e6dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#f5f4ed]"
              >
                New ER diagram
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default DiagramDashboard;
