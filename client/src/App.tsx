import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import CanvasPlayground from "./pages/CanvasPlayground";
import DashBoard from "./pages/DashBoard";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { getAppSession } from "./lib/authClient";
import { Navigate } from "react-router-dom";
import WhiteBoard from "./pages/WhiteBoard";
import DiagramDashboard from "./pages/DiagramDashboard";
import ErDashboard from "./pages/ErDashboard";

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
    <div className="bg-[#F5F4ED] w-screen min-h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/diagrams-dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diagrams-dashboard"
          element={
            <ProtectedRoute>
              <DiagramDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schema-dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/er-dashboard"
          element={
            <ProtectedRoute>
              <ErDashboard />
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
        <Route
          path="/whiteboard"
          element={
            <ProtectedRoute>
              <WhiteBoard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
