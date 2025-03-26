import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { useDispatch, useSelector } from 'react-redux';
import { setGeoJsonData } from '../redux/actions';
import { useState } from 'react';

function FetchWmsGeoJson() {
  const dispatch = useDispatch();
  const geoJsonData = useSelector((state: any) => state.geoJsonData); // Retrieve geoJsonData from Redux store
  const [wmsUrl, setWmsUrl] = useState(""); // State for holding the WMS URL input by the user

  // Function to fetch WMS and WFS data
  const fetchWmsAndWfsData = async () => {
    if (!wmsUrl) {
      alert("Please enter a WMS URL.");
      return;
    }

    try {
      // 1. Fetch WMS GetCapabilities
      const capabilitiesUrl = `${wmsUrl}?service=WMS&request=GetCapabilities`;
      const response = await fetch(capabilitiesUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");

      // 2. Extract layers from WMS GetCapabilities
      const layers = xml.getElementsByTagName("Layer");
      if (layers.length === 0) {
        alert("No layers found in WMS.");
        return;
      }
      
      const layerName = layers[0].getElementsByTagName("Name")[0]?.textContent || "Unnamed Layer";

      // 3. Check if WFS is available
      const serviceNodes = xml.getElementsByTagName("Service");
      let wfsAvailable = false;
      for (let i = 0; i < serviceNodes.length; i++) {
        if (serviceNodes[i].textContent?.includes("WFS")) {
          wfsAvailable = true;
          break;
        }
      }

      if (!wfsAvailable) {
        alert("This WMS service does not support WFS. Please provide a different link.");
        return;
      }

      // 4. Construct the WFS URL (switching from WMS to WFS)
      const wfsUrl = wmsUrl.replace("service=WMS", "service=WFS");
      const geojsonUrl = `${wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json`;

      // 5. Fetch WFS GeoJSON data
      const geojsonResponse = await fetch(geojsonUrl);
      if (!geojsonResponse.ok) {
        alert("Failed to fetch GeoJSON. This WMS service might not be compatible with WFS.");
        return;
      }
      
      const geojsonData = await geojsonResponse.json();

      // 6. Fetch WMS image (for visual representation)
      const wmsImageUrl = `${wmsUrl}?service=WMS&request=GetMap&layers=${layerName}&format=image/png&width=800&height=600&srs=EPSG:4326&bbox=-180,-90,180,90`;
      const wmsImageResponse = await fetch(wmsImageUrl);
      if (!wmsImageResponse.ok) {
        alert("Failed to fetch WMS image.");
        return;
      }
      
      const wmsImageBlob = await wmsImageResponse.blob();
      const wmsImageUrlBlob = URL.createObjectURL(wmsImageBlob);

      // 7. Separate storage of WMS image and WFS GeoJSON data in Redux
      // Create a new map for WMS and WFS data separately but use the same key (layerName)

      // Dispatch WMS image data to Redux (for the image)
      const updatedWmsMap = new Map(geoJsonData); 
      updatedWmsMap.set(layerName, { imageUrl: wmsImageUrlBlob }); // Store WMS image URL

      // Dispatch the WMS data to Redux for the layers (WMS)
      dispatch(setGeoJsonData({ type: "WMS", data: updatedWmsMap }));

      // Dispatch WFS GeoJSON data to Redux (for GeoJSON data)
      const updatedWfsMap = new Map(geoJsonData);
      updatedWfsMap.set(layerName, geojsonData); // Store GeoJSON data

      // Dispatch the WFS data to Redux for the layers (WFS)
      dispatch(setGeoJsonData({ type: "WFS", data: updatedWfsMap }));

    } catch (error) {
      alert("Error fetching WMS and WFS data.");
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter WMS URL"
        value={wmsUrl}
        onChange={(e) => setWmsUrl(e.target.value)} // Update the WMS URL state
        style={{ padding: "8px", borderRadius: "5px", marginRight: "10px" }}
      />
      <button
        onClick={fetchWmsAndWfsData} // Call fetchWmsAndWfsData when the button is clicked
        style={{
          backgroundColor: "gray",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Fetch WMS and WFS Data
      </button>
    </>
  );
}

export default FetchWmsGeoJson;
