import { useState } from "react";
import "./App.css";
import './chartjs-setup';
import GeoJSONUpload from "./components/GeoJsonUpload";
import Dashboard from "./components/Dashboard";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Dashboard />
    </div>
  );
}

export default App;
