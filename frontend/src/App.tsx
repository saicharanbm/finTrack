import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden dark">
      <Outlet />
    </div>
  );
}

export default App;
