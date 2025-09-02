import "./App.css";
import { Outlet } from "react-router-dom";
import { useTheme } from "./hooks/useTheme";

function App() {
  useTheme();
  return (
    <div className="home h-screen w-screen overflow-hidden text-title font-mono">
      <Outlet />
    </div>
  );
}

export default App;
