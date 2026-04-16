import { Route, Routes } from "react-router-dom";
import CanvasPlayground from "./pages/CanvasPlayground";
import DashBoard from "./pages/DashBoard";
import Home from "./pages/Home";
import Auth from "./pages/Auth";

const App = () => {
  return (
    <div className="bg-[#141414] w-screen h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/playground" element={<CanvasPlayground />} />
      </Routes>
    </div>
  );
};

export default App;
