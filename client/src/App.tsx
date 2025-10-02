import { Route, Routes } from "react-router-dom";
import CanvasPlayground from "./pages/CanvasPlayground";

const App = () => {
  return (
    <div className="bg-black w-screen h-screen overflow-hidden text-white">
      <Routes>
        <Route path="/" element={<CanvasPlayground />} />
        <Route path="/import" element={<CanvasPlayground />} />
      </Routes>
    </div>
  );
};

export default App;
