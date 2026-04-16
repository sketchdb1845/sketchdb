import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen bg-[#f5f4ed] text-[#1F1F1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between rounded-full border border-[#f0eee6] bg-[#faf9f5]/90 px-4 py-3 shadow-[0_0_0_1px_rgba(224,220,209,0.45)] backdrop-blur">
          <div>
            <p className="font-sans-claude text-[30px] uppercase font-bold text-[#c96442]">
              SketchDB
            </p>
           
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-medium text-[#4d4c48] transition hover:border-[#d1cfc5] hover:bg-[#faf9f5]"
            >
              Projects
            </button>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="rounded-full bg-[#c96442] px-4 py-2 text-sm font-medium text-[#faf9f5] transition hover:bg-[#b95d3c]"
            >
              Create account
            </button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div className="space-y-8">
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl leading-[1.05] tracking-[-0.02em] text-[#1F1F1E] sm:text-6xl lg:text-[4.4rem]">
                Design your database like a published page.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#5e5d59] sm:text-xl">
                SketchDB turns schema planning into a calmer workflow: create tables, assign relationships, and store SQL projects per user with a warm, editorial interface.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="rounded-full bg-[#c96442] px-6 py-3.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c]"
              >
                Start free
              </button>
              <button
                onClick={() => navigate("/playground")}
                className="rounded-full border border-[#e8e6dc] bg-white px-6 py-3.5 text-sm font-semibold text-[#4d4c48] transition hover:border-[#d1cfc5] hover:bg-[#faf9f5]"
              >
                Open playground
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-[#c96442]/10 blur-3xl" />
            <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-[#d8ad7a]/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e6dc] bg-[#faf9f5] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="rounded-[1.5rem] border border-[#f0eee6] bg-[#f5f4ed] p-4">
                <div className="flex items-center justify-between border-b border-[#e8e6dc] pb-3">
                  <div>
                    <p className="font-sans-claude text-2xl text-[#1F1F1E]">Project Journal</p>
                    <p className="text-sm text-[#87867f]">A calm snapshot of your latest schema</p>
                  </div>
                  <span className="rounded-full bg-[#e8e6dc] px-3 py-1 text-xs font-medium text-[#4d4c48]">Live</span>
                </div>

                <div className="mt-4 grid gap-3">
                      {[
                        ["Customers", "6 attributes", "bg-[#c96442]"],
                        ["Orders", "8 attributes", "bg-[#d97757]"],
                        ["Payments", "5 attributes", "bg-[#5e5d59]"],
                      ].map(([name, meta, dotClass]) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl border border-[#f0eee6] bg-white px-4 py-4">
                      <div className="flex items-center gap-3">
                            <span className={`h-3 w-3 rounded-full ${dotClass}`} />
                        <div>
                          <p className="font-medium text-[#1F1F1E]">{name}</p>
                          <p className="text-sm text-[#87867f]">{meta}</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#5e5d59]">SQL stored</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-[#e8e6dc] bg-[#1F1F1E] p-4 text-[#faf9f5]">
                  <p className="font-sans-claude text-2xl leading-none">Design notes</p>
                  <p className="mt-2 text-sm leading-6 text-[#b0aea5]">
                    Create a table, choose a color once, and carry that visual identity through the canvas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
