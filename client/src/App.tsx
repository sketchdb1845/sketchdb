import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import CanvasPlayground from "./pages/CanvasPlayground";
import DashBoard from "./pages/DashBoard";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { getAppSession } from "./lib/authClient";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">("loading");

  useEffect(() => {
    const run = async () => {
      const session = await getAppSession();
      setStatus(session.user ? "allowed" : "blocked");
    };

    run();
  }, []);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center bg-[#f5f4ed] text-[#5e5d59]">Loading...</div>;
  }

  if (status === "blocked") {
    return <Navigate to="/auth?mode=signin" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  return (
    <div className="bg-[#ad9f9f] w-screen min-h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <CanvasPlayground />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
