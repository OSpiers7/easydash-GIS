import { useEffect, useState } from "react";
import "./App.css";
import "./chartjs-setup";
import "bootstrap/dist/css/bootstrap.min.css";
import GeoJSONUpload from "./components/GeoJsonUpload";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import { supabase } from "./supabaseClient";
import { useDispatch } from 'react-redux';  // Import useDispatch
import { setGeoJsonData, setSaveState } from './redux/actions';
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import 'leaflet/dist/leaflet.css';

function App() {
  const [count, setCount] = useState(0);
  const [dashboardKey, setDashboardKey] = useState<string | null>(null);

  const dispatch = useDispatch();

  const syncAllDashboardFilesToLocalStorage = async () => {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('dashboards')
        .list();

      if (listError) throw listError;
      if (!files) return;

      // Loop through each file
      for (const file of files) {
        // Download the file
        const { data, error: downloadError } = await supabase.storage
          .from('dashboards')
          .download(file.name);

        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }

        if (!data) continue;

        // Convert blob to text and parse JSON
        const text = await data.text();
        const dashboardData = JSON.parse(text);
        
        // Store the entire dashboard data (widgets + mapData) in localStorage
        const keyName = file.name.replace(/\.json$/, '');
        localStorage.setItem(keyName, JSON.stringify(dashboardData));
      }

      console.log('Dashboard synchronization complete');
      dispatch(setSaveState("sync")); // Notify components that sync is complete
    } catch (error) {
      console.error('Error syncing dashboards:', error);
    }
  };

  const syncGeoJsonDatasetsToRedux = async () => {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('datasets')
        .list();
  
      if (listError) throw listError;
      if (!files) return;
  
      const geoJsonMap = new Map<string, FeatureCollection<Geometry, GeoJsonProperties>>();
  
      for (const file of files) {
        if (!file.name.endsWith('.geojson')) continue;
  
        const { data, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(file.name);
  
        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }
  
        const text = await data.text();
        const json = JSON.parse(text) as FeatureCollection<Geometry, GeoJsonProperties>;
        geoJsonMap.set(file.name, json);
      }
  
      dispatch(setGeoJsonData(geoJsonMap));
      console.log("Loaded GeoJSON datasets into Redux");
    } catch (error) {
      console.error('Error syncing GeoJSON datasets:', error);
    }
  };
  
  // Sync all saved dashboards and geoJSON data from Supabase
  useEffect(() => {
    syncAllDashboardFilesToLocalStorage();
    syncGeoJsonDatasetsToRedux();
  }, []);

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
