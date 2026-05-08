import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppSession } from "../lib/authClient";

const Home = () => {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getAppSession();

      if (session.user?.name?.trim()) {
        setProfileName(session.user.name.trim());
        return;
      }

      if (session.user?.email?.trim()) {
        setProfileName(session.user.email.trim().split("@")[0]);
        return;
      }

      setProfileName(null);
    };

    loadSession();
  }, []);

  const profileInitial = useMemo(() => {
    if (!profileName) return "U";
    return profileName.charAt(0).toUpperCase();
  }, [profileName]);

  return (
    <section className="min-h-screen bg-[#f5f4ed] text-[#1F1F1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex items-center justify-between rounded-full border border-[#f0eee6] bg-[#faf9f5]/90 px-4 py-3 shadow-sm backdrop-blur">
          <p className="font-sans-claude text-[30px] font-bold uppercase text-[#c96442]">
            SketchDB
          </p>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => navigate("/diagrams-dashboard")}
              className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-medium text-[#4d4c48] transition hover:bg-[#faf9f5]"
            >
              Projects
            </button>

            {profileName ? (
              <button
                onClick={() => navigate("/diagrams-dashboard")}
                className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-white px-3 py-2 text-sm font-medium text-[#4d4c48] transition hover:bg-[#faf9f5]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c96442] text-xs font-semibold text-white">
                  {profileInitial}
                </span>
                <span className="max-w-[150px] truncate">{profileName}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="rounded-full bg-[#c96442] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b95d3c]"
              >
                Create account
              </button>
            )}
          </div>
        </header>

        {/* Main */}
        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          {/* Left */}
          <div className="space-y-8">
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl leading-tight tracking-tight sm:text-6xl lg:text-[4.4rem]">
                Design your database like a published page.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-[#5e5d59] sm:text-xl">
                SketchDB turns schema planning into a calmer workflow: create
                tables, assign relationships, and store SQL projects per user
                with a warm, editorial interface.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="rounded-full bg-[#c96442] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#b95d3c]"
              >
                Start free
              </button>

              <button
                onClick={() => navigate("/playground")}
                className="rounded-full border border-[#e8e6dc] bg-white px-6 py-3.5 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#faf9f5]"
              >
                Open playground
              </button>

              <button
                onClick={() => navigate("/whiteboard")}
                className="rounded-full border border-[#e8e6dc] bg-white px-6 py-3.5 text-sm font-semibold text-[#4d4c48] transition hover:bg-[#faf9f5]"
              >
                Open WhiteBoard
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-[#c96442]/10 blur-3xl"></div>
            <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-[#d8ad7a]/20 blur-3xl"></div>

            {/* Terminal */}
            <div className="relative rounded-2xl border border-black/20 bg-[#181715] shadow-2xl overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#cc785c]/10 via-transparent to-transparent"></div>

              {/* Header */}
              <div className="relative flex items-center gap-2 border-b border-black/20 bg-[#1f1e1b] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-600"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <div className="h-3 w-3 rounded-full bg-[#cc785c]"></div>

                <span className="ml-3 text-xs font-mono text-[#8e8b82]">
                  sketchdb_schema.sql
                </span>
              </div>

              {/* Body */}
              <div className="relative space-y-1 p-6 font-mono text-sm leading-relaxed text-[#a09d96]">
                <p className="text-[#8e8b82]">-- Generated by SketchDB</p>
                <p className="text-[#8e8b82]">
                  -- {new Date().toLocaleDateString()}
                </p>

                <br />

                <p>
                  <span className="text-[#cc785c]">CREATE TABLE</span>{" "}
                  <span className="text-white">users</span> (
                </p>

                <p className="pl-4">
                  <span className="text-[#e8a55a]">id</span>{" "}
                  <span className="text-[#8e8b82]">SERIAL</span>{" "}
                  <span className="text-[#cc785c]">PRIMARY KEY</span>,
                </p>

                <p className="pl-4">
                  <span className="text-[#e8a55a]">email</span>{" "}
                  <span className="text-[#8e8b82]">VARCHAR(255)</span>{" "}
                  <span className="text-[#cc785c]">UNIQUE NOT NULL</span>,
                </p>

                <p className="pl-4">
                  <span className="text-[#e8a55a]">created_at</span>{" "}
                  <span className="text-[#8e8b82]">TIMESTAMP</span>{" "}
                  <span className="text-[#cc785c]">DEFAULT NOW()</span>
                </p>

                <p className="text-white">);</p>

                <br />

                <p>
                  <span className="text-[#cc785c]">CREATE TABLE</span>{" "}
                  <span className="text-white">diagrams</span> (
                </p>

                <p className="pl-4">
                  <span className="text-[#e8a55a]">id</span>{" "}
                  <span className="text-[#8e8b82]">SERIAL</span>{" "}
                  <span className="text-[#cc785c]">PRIMARY KEY</span>,
                </p>

                <p className="pl-4">
                  <span className="text-[#e8a55a]">user_id</span>{" "}
                  <span className="text-[#8e8b82]">INT</span>{" "}
                  <span className="text-[#cc785c]">
                    REFERENCES users(id)
                  </span>
                  ,
                </p>

                <p className="pl-4">
                  <span className="text-[#e8a55a]">name</span>{" "}
                  <span className="text-[#8e8b82]">VARCHAR(100)</span>{" "}
                  <span className="text-[#cc785c]">NOT NULL</span>
                </p>

                <p className="text-white">);</p>

                <br />

                <p className="text-[#cc785c]">
                  -- ✓ Schema ready for production
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;