import { useState } from "react";
import "./App.css";
import GeoJSONUpload from "./GeoJSONUpload";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Upload a GEOJSON file</h1>
      <GeoJSONUpload />
    </div>
  );
}

export default App;
