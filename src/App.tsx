import { useState } from "react";
import "./App.css";
import "./chartjs-setup";
import "bootstrap/dist/css/bootstrap.min.css";
import GeoJSONUpload from "./components/GeoJsonUpload";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";

function App() {
  const [count, setCount] = useState(0);
  const [dashboardKey, setDashboardKey] = useState<string | null>(null);

  return (
    <div>
      {dashboardKey ? (
        <Dashboard name={dashboardKey} onBack={() => setDashboardKey(null)} />
      ) : (
        <HomePage onSelectDashboard={setDashboardKey} />
      )}
    </div>
  );
}

export default App;
